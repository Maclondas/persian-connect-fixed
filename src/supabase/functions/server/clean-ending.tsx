// Default 404 handler
app.all('*', (c) => {
  console.log('❌ Route not found:', c.req.url)
  return c.json({ error: 'Route not found' }, 404)
})

// Start the server
Deno.serve(app.fetch)