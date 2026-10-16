import supabase from '../config/supabase.js';
import sendEmail from './sendEmail.js';

const ORDER_TIME_LIMIT_MS =
  2 * 60 * 60 * 1000;

export const cancelExpiredOrders = async () => {
  try {
    const expiryTime = new Date(
      Date.now() - ORDER_TIME_LIMIT_MS
    ).toISOString();

    // Find orders older than 2 hours
    // that are still active.
    const {
      data: expiredOrders,
      error: ordersError,
    } = await supabase
      .from('orders')
      .select(
        'id, user_id, order_status, created_at, total_amount'
      )
      .lt('created_at', expiryTime)
      .not(
        'order_status',
        'in',
        '(Delivered,Cancelled)'
      );

    if (ordersError) {
      console.error(
        'Error finding expired orders:',
        ordersError
      );

      return;
    }

    if (
      !expiredOrders ||
      expiredOrders.length === 0
    ) {
      return;
    }

    for (const order of expiredOrders) {
      // Cancel the order
      const {
        data: cancelledOrder,
        error: updateError,
      } = await supabase
        .from('orders')
        .update({
          order_status: 'Cancelled',
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', order.id)
        .not(
          'order_status',
          'in',
          '(Delivered,Cancelled)'
        )
        .select('*')
        .maybeSingle();

      if (updateError) {
        console.error(
          `Failed to cancel order ${order.id}:`,
          updateError
        );

        continue;
      }

      // If another process already changed the order,
      // do not send a cancellation email.
      if (!cancelledOrder) {
        continue;
      }

      // Save cancellation in order history
      const {
        error: historyError,
      } = await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'Cancelled',
        });

      if (historyError) {
        console.error(
          `Failed to save cancellation history for order ${order.id}:`,
          historyError
        );
      }

      // Get customer information
      const {
        data: user,
        error: userError,
      } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', order.user_id)
        .maybeSingle();

      if (userError) {
        console.error(
          `Failed to get customer information for order ${order.id}:`,
          userError
        );

        continue;
      }

      // Send cancellation email
      if (user?.email) {
        try {
          const orderDate = new Date(
            order.created_at
          ).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          });

          await sendEmail({
            sendTo: user.email,
            subject:
              'Order Cancelled - Food Express',
            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: auto;
                  padding: 30px;
                  border: 1px solid #e5e5e5;
                  border-radius: 12px;
                  background: #ffffff;
                "
              >
                <h2
                  style="
                    color: #ff5722;
                    margin-bottom: 20px;
                  "
                >
                  Food Express
                </h2>

                <h3>
                  Hello ${user.name || 'Customer'},
                </h3>

                <p>
                  Your Food Express order has been
                  automatically cancelled because it
                  was not completed within the
                  2-hour delivery window.
                </p>

                <div
                  style="
                    background: #f7f7f7;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                  "
                >
                  <p>
                    <strong>Order ID:</strong>
                    ${order.id}
                  </p>

                  <p>
                    <strong>Order Placed:</strong>
                    ${orderDate}
                  </p>

                  <p>
                    <strong>Order Amount:</strong>
                    ₹${Number(
                      order.total_amount || 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    <strong>Status:</strong>
                    <span
                      style="
                        color: #d32f2f;
                        font-weight: bold;
                      "
                    >
                      Cancelled
                    </span>
                  </p>
                </div>

                <p>
                  We apologize for the inconvenience.
                </p>

                <p>
                  Thank you for choosing
                  <strong>Food Express</strong>.
                </p>
              </div>
            `,
          });

          console.log(
            `Cancellation email sent to ${user.email} for order ${order.id}`
          );
        } catch (emailError) {
          console.error(
            `Failed to send cancellation email for order ${order.id}:`,
            emailError
          );
        }
      }

      console.log(
        `Order ${order.id} automatically cancelled after 2 hours.`
      );
    }
  } catch (error) {
    console.error(
      'Automatic order cancellation error:',
      error
    );
  }
};