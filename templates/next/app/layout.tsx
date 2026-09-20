export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0f0f0f', color: '#f0f0f0', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
