import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import realDataService from './services/real-data-service';
import { toast } from 'sonner';

export function ImageUploadTester() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      addTestResult(`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const testUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    addTestResult('Starting upload test...');

    try {
      console.log('🔄 Starting upload for file:', selectedFile.name);
      const url = await realDataService.uploadFile(selectedFile, 'ad-image');
      
      console.log('📤 Upload completed. URL type:', url.startsWith('data:') ? 'Base64' : 'Regular');
      console.log('📤 Upload completed. URL length:', url.length);
      console.log('📤 Upload completed. URL preview:', url.substring(0, 100) + '...');
      
      setUploadedUrl(url);
      addTestResult(`✅ Upload successful! URL type: ${url.startsWith('data:') ? 'Base64' : 'Regular'}`);
      addTestResult(`📏 URL length: ${url.length} characters`);
      addTestResult(`🔗 URL preview: ${url.substring(0, 50)}...`);
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('🖼️ Current uploadedUrl state:', uploadedUrl.substring(0, 100) + '...');
      }, 100);
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      addTestResult(`❌ Upload failed: ${error}`);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearTest = () => {
    setSelectedFile(null);
    setUploadedUrl('');
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Image Upload Tester</h1>

        <Card>
          <CardHeader>
            <CardTitle>Test Image Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mb-4"
              />
            </div>

            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected File:</h4>
                <p>Name: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                <p>Type: {selectedFile.type}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                onClick={testUpload} 
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Test Upload
                  </>
                )}
              </Button>
              
              <Button onClick={clearTest} variant="outline">
                Clear Test
              </Button>
            </div>

            {uploadedUrl && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Upload Result:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700">Upload Successful!</span>
                    </div>
                    <p className="text-sm text-green-600 break-all">URL: {uploadedUrl}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Image Preview:</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Try standard img tag first for base64 */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Direct img tag:</p>
                        <img
                          src={uploadedUrl}
                          alt="Direct upload test"
                          className="max-w-full h-auto max-h-64 object-contain mx-auto border rounded"
                          onError={(e) => {
                            console.error('Direct img failed to load');
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log('✅ Direct img loaded successfully')}
                        />
                      </div>
                      
                      {/* Also try ImageWithFallback */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ImageWithFallback component:</p>
                        <ImageWithFallback
                          src={uploadedUrl}
                          alt="Uploaded test image"
                          className="max-w-full h-auto max-h-64 object-contain mx-auto border rounded"
                        />
                      </div>
                      
                      {/* Show URL length info */}
                      <div className="text-xs text-gray-500">
                        <p>URL Type: {uploadedUrl.startsWith('data:') ? 'Base64 Data URL' : 'Regular URL'}</p>
                        <p>URL Length: {uploadedUrl.length} characters</p>
                        {uploadedUrl.length > 50000 && (
                          <p className="text-orange-600">⚠️ Very long URL - this might cause display issues</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {testResults.length > 0 ? (
                testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))
              ) : (
                <div className="text-gray-500">No tests run yet...</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Select an image file using the file input above</p>
              <p>2. Click "Test Upload" to test the upload functionality</p>
              <p>3. If successful, you should see the image preview below</p>
              <p>4. Check the test log for detailed information</p>
              <p className="text-blue-600 font-medium">
                This test will help debug why images aren't appearing in your ads.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}