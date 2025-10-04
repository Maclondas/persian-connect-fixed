import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Copy } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface EdgeFunctionDeploymentHelperProps {
  onClose: () => void;
}

export function EdgeFunctionDeploymentHelper({ onClose }: EdgeFunctionDeploymentHelperProps) {
  const [step, setStep] = useState<'check' | 'cli' | 'manual'>('check');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cliCommands = [
    { id: 'install', command: 'npm install -g supabase', description: 'Install Supabase CLI' },
    { id: 'login', command: 'supabase login', description: 'Login to your Supabase account' },
    { id: 'link', command: `supabase link --project-ref ${projectId}`, description: 'Link to your project' },
    { id: 'deploy', command: 'supabase functions deploy', description: 'Deploy all functions' }
  ];

  const serverCode = `import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://*.vercel.app',
    'https://*.netlify.app',
    'https://*.github.io',
    'https://persian-connect.com',
    'https://www.persian-connect.com',
    'https://*.persian-connect.com'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use('*', logger(console.log))

// Health check endpoint
app.get('/make-server-e5dee741/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Persian Connect API Server is running'
  })
})

// Base route
app.get('/make-server-e5dee741', (c) => {
  return c.json({ 
    message: 'Persian Connect API Server',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/auth/signup',
      '/auth/signin'
    ]
  })
})

// Simple signup endpoint for testing
app.post('/make-server-e5dee741/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields: email, password, name' }, 400)
    }

    // For now, return a success response to test deployment
    return c.json({ 
      message: 'Signup endpoint is working! Database integration needed.',
      user: {
        email,
        name,
        id: 'test-' + Date.now()
      }
    })
  } catch (error) {
    return c.json({ error: 'Signup test failed: ' + error.message }, 500)
  }
})

Deno.serve(app.fetch)`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Deploy Edge Function
            <Badge variant="destructive">Fix Server Not Available</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'check' && (
            <>
              <Alert>
                <AlertDescription>
                  Your Supabase Edge Function needs to be deployed to fix the "Server not available" error.
                  Choose your preferred deployment method:
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">🛠️ CLI Deployment (Recommended)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use the Supabase CLI for easy deployment. Best for developers.
                  </p>
                  <Button onClick={() => setStep('cli')} className="w-full">
                    Use CLI Method
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">📋 Manual Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy code to Supabase dashboard. Good for quick setup.
                  </p>
                  <Button onClick={() => setStep('manual')} variant="outline" className="w-full">
                    Use Manual Method
                  </Button>
                </Card>
              </div>
            </>
          )}

          {step === 'cli' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setStep('check')}>
                  ← Back
                </Button>
                <h3 className="font-medium">CLI Deployment Steps</h3>
              </div>

              <Alert>
                <AlertDescription>
                  Run these commands in your terminal, one by one:
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {cliCommands.map((cmd, index) => (
                  <div key={cmd.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-medium">{cmd.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                        {cmd.command}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(cmd.command, cmd.id)}
                      >
                        {copied === cmd.id ? '✓' : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Alert>
                <AlertDescription>
                  <strong>After deployment:</strong> Test your server at:
                  <br />
                  <code>https://{projectId}.supabase.co/functions/v1/make-server-e5dee741/health</code>
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === 'manual' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setStep('check')}>
                  ← Back
                </Button>
                <h3 className="font-medium">Manual Dashboard Deployment</h3>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Steps:</strong>
                  <br />
                  1. Go to your <a href={`https://supabase.com/dashboard/project/${projectId}/functions`} target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase Functions dashboard</a>
                  <br />
                  2. Click "Create a new function"
                  <br />
                  3. Name it: <code>make-server-e5dee741</code>
                  <br />
                  4. Copy the code below and paste it into the editor
                  <br />
                  5. Click "Deploy function"
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Function Code:</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(serverCode, 'serverCode')}
                  >
                    {copied === 'serverCode' ? '✓ Copied' : <>Copy All <Copy className="h-4 w-4 ml-1" /></>}
                  </Button>
                </div>
                
                <Textarea
                  value={serverCode}
                  readOnly
                  className="h-60 text-xs font-mono"
                />
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Make sure the function name is exactly <code>make-server-e5dee741</code>
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank')}
              className="flex-1"
            >
              Open Supabase Dashboard
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}