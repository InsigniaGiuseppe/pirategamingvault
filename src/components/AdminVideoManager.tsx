
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Youtube, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Plus,
  Download,
  Loader2
} from 'lucide-react';
import { 
  getVideos, 
  processYouTubeUrls, 
  saveVideos, 
  updateVideo, 
  deleteVideo,
  Video 
} from '@/services/videoService';

const AdminVideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await getVideos(true); // Include inactive videos for admin
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processBulkVideos = async () => {
    if (!bulkUrls.trim()) {
      toast({
        title: "Error",
        description: "Please enter YouTube URLs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress('Parsing URLs...');
      
      const urls = bulkUrls.split('\n').filter(url => url.trim());
      console.log('🎬 Starting bulk video processing for', urls.length, 'URLs');
      
      // Check for Shorts URLs and inform user
      const shortsCount = urls.filter(url => url.includes('/shorts/')).length;
      if (shortsCount > 0) {
        setProcessingProgress(`Found ${shortsCount} YouTube Shorts. Processing...`);
      }
      
      setProcessingProgress('Fetching video details from YouTube...');
      const processedVideos = await processYouTubeUrls(urls);
      
      if (processedVideos.length === 0) {
        throw new Error('No videos could be processed. Please check your URLs and try again.');
      }
      
      setProcessingProgress('Saving videos to database...');
      const savedVideos = await saveVideos(processedVideos);
      
      setVideos(prev => [...savedVideos, ...prev]);
      setBulkUrls('');
      setProcessingProgress('');
      
      const shortsAdded = savedVideos.filter(v => v.category === 'shorts').length;
      const regularAdded = savedVideos.length - shortsAdded;
      
      toast({
        title: "Success",
        description: `Successfully added ${savedVideos.length} videos${shortsAdded > 0 ? ` (${shortsAdded} Shorts, ${regularAdded} regular videos)` : ''}`,
      });
    } catch (error) {
      console.error('Failed to process videos:', error);
      setProcessingProgress('');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process videos. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVideoActive = async (video: Video) => {
    try {
      const updated = await updateVideo(video.id, { is_active: !video.is_active });
      setVideos(prev => prev.map(v => v.id === video.id ? updated : v));
      
      toast({
        title: "Success",
        description: `Video ${updated.is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Failed to update video:', error);
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const updateVideoReward = async (video: Video, newReward: number) => {
    try {
      const updated = await updateVideo(video.id, { reward_amount: newReward });
      setVideos(prev => prev.map(v => v.id === video.id ? updated : v));
      
      toast({
        title: "Success",
        description: "Reward updated successfully",
      });
    } catch (error) {
      console.error('Failed to update reward:', error);
      toast({
        title: "Error",
        description: "Failed to update reward",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) return;

    try {
      await deleteVideo(video.id);
      setVideos(prev => prev.filter(v => v.id !== video.id));
      
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const exportVideos = () => {
    const csvContent = [
      ['Title', 'Platform', 'Duration', 'Reward', 'Active', 'Views', 'Completions', 'URL'].join(','),
      ...videos.map(video => [
        `"${video.title}"`,
        video.platform_type,
        video.duration_display,
        video.reward_amount,
        video.is_active,
        video.view_count,
        video.completion_count,
        video.original_url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `videos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalVideos = videos.length;
  const activeVideos = videos.filter(v => v.is_active).length;
  const totalRewards = videos.reduce((sum, v) => sum + v.reward_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Management</h2>
        <div className="flex gap-2">
          <Button onClick={exportVideos} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={loadVideos} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalVideos}</div>
            <div className="text-sm text-gray-600">Total Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeVideos}</div>
            <div className="text-sm text-gray-600">Active Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalRewards}</div>
            <div className="text-sm text-gray-600">Total Rewards Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {videos.reduce((sum, v) => sum + v.completion_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Completions</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bulk-add" className="w-full">
        <TabsList>
          <TabsTrigger value="bulk-add">Bulk Add Videos</TabsTrigger>
          <TabsTrigger value="manage">Manage Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                Bulk YouTube Video Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-urls">YouTube URLs (one per line)</Label>
                <Textarea
                  id="bulk-urls"
                  placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/shorts/abc123def45
https://youtu.be/jfKfPfyJRdk`}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>• Supports regular YouTube videos and YouTube Shorts</p>
                <p>• Videos will be automatically processed with titles, descriptions, and durations</p>
                <p>• Rewards: Regular videos (1 coin per 30s), Shorts (3-4 coins based on length)</p>
                <p>• All videos are set as active by default</p>
              </div>
              {processingProgress && (
                <div className="text-sm text-blue-600 font-medium">
                  {processingProgress}
                </div>
              )}
              <Button 
                onClick={processBulkVideos} 
                disabled={isProcessing || !bulkUrls.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Videos...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Videos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Library ({videos.length} videos)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Video</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Analytics</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium max-w-[300px] truncate">
                                  {video.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {video.video_id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {video.platform_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{video.duration_display}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={video.reward_amount}
                              onChange={(e) => updateVideoReward(video, parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="1"
                              max="100"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={video.is_active}
                                onCheckedChange={() => toggleVideoActive(video)}
                              />
                              {video.is_active ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Views: {video.view_count}</div>
                              <div>Completed: {video.completion_count}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(video.original_url, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteVideo(video)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVideoManager;
