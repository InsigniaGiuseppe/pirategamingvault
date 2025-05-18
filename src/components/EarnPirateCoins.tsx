
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Twitch, Youtube, Clock, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VideoItem {
  id: string;
  type: 'twitch' | 'youtube';
  title: string;
  thumbnail: string;
  duration: string;
  reward: number;
  url: string;
}

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: '1',
    type: 'twitch',
    title: 'Epic Boss Battle in Elden Ring',
    thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
    duration: '3:45',
    reward: 15,
    url: 'https://twitch.tv/dannehsbum'
  },
  {
    id: '2',
    type: 'youtube',
    title: 'Ultimate Guide to Palworld',
    thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
    duration: '5:20',
    reward: 25,
    url: 'https://youtube.com'
  },
  {
    id: '3',
    type: 'twitch',
    title: 'First Look at New DLC',
    thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
    duration: '2:30',
    reward: 10,
    url: 'https://twitch.tv/dannehsbum'
  },
  {
    id: '4',
    type: 'youtube',
    title: 'Secret Easter Eggs in Starfield',
    thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
    duration: '4:15',
    reward: 20,
    url: 'https://youtube.com'
  }
];

const EarnPirateCoins = () => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const { addPirateCoins } = useAuth();
  const { toast } = useToast();

  const handleWatchVideo = (video: VideoItem) => {
    // In a real implementation, you would track video watching progress
    // For now, we'll simulate watching by opening the URL and immediately rewarding
    window.open(video.url, '_blank');
    
    // Wait for a simulated watch time (just for demo, you'd verify actual watch time)
    setTimeout(() => {
      if (!watchedVideos.has(video.id)) {
        addPirateCoins(video.reward);
        setWatchedVideos(new Set([...watchedVideos, video.id]));
        
        toast({
          title: "Coins Earned!",
          description: `You earned ${video.reward} Pirate Coins!`,
          duration: 3000,
        });
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading">Earn Pirate Coins</h2>
        <div className="flex items-center gap-1">
          <p className="text-sm text-gray-600">Watch videos to earn coins</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {SAMPLE_VIDEOS.map((video) => (
          <Card key={video.id} className="overflow-hidden bg-white shadow-saas">
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-[160px] object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                <Clock size={12} />
                {video.duration}
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                {video.type === 'twitch' ? (
                  <><Twitch size={12} className="text-purple-400" /> Twitch</>
                ) : (
                  <><Youtube size={12} className="text-red-500" /> YouTube</>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-2 line-clamp-2">{video.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Coins size={14} className="text-yellow-500" />
                  <span>{video.reward} coins</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                onClick={() => handleWatchVideo(video)}
                disabled={watchedVideos.has(video.id)}
                className={`w-full ${
                  watchedVideos.has(video.id)
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                }`}
              >
                {watchedVideos.has(video.id) ? "Already Watched" : "Watch & Earn"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EarnPirateCoins;
