import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ThemeProvider } from '../context/ThemeContext';
import Header from '../components/Header';

export const metadata = {
  title: 'Food Ordering Website',
  description:
    'Full stack food ordering platform built with Next.js 14 and Node.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}