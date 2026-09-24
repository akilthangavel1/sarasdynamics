import HeroSection from '@/components/ui/hero-section-9'; // Adjust the import path as needed
import { Users, Briefcase, Link as LinkIcon } from 'lucide-react';

const HeroSectionDemo = () => {
  // Sample data to be passed as props
  const heroData = {
    title: (
      <>
        A new way to learn <br /> & get knowledge
      </>
    ),
    subtitle: 'EduFlex is here for you with various courses & materials from skilled tutors all around the world.',
    actions: [
      {
        text: 'Join the Class',
        onClick: () => alert('Join the Class clicked!'),
        variant: 'default' as const,
      },
      {
        text: 'Learn more',
        onClick: () => alert('Learn More clicked!'),
        variant: 'outline' as const,
      },
    ],
    stats: [
      {
        value: '15,2K',
        label: 'Active students',
        icon: <Users className="h-5 w-5 text-muted-foreground" />,
      },
      {
        value: '4,5K',
        label: 'Tutors',
        icon: <Briefcase className="h-5 w-5 text-muted-foreground" />,
      },
      {
        value: 'Resources',
        label: '',
        icon: <LinkIcon className="h-5 w-5 text-muted-foreground" />,
      },
    ],
    images: [
      'https://cdn.21st.dev/assets/mirror/80/807b564e6a3dfa435b6ffb617953d522554723e27b78eaa0ae311392cb957016.jpg',
      'https://cdn.21st.dev/assets/mirror/03/03bacbb04f5b3f7d2526f9d8125bf7013c8342ed54c47bd440c203e9ac54fd2d.jpg',
      'https://cdn.21st.dev/assets/mirror/dd/dd8be3dc3a1f8735a6a562e3f6f23c7ee250438666efee22c78e37af73cc597b.jpg',
    ],
  };

  return (
    <div className="w-full bg-background">
      <HeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        actions={heroData.actions}
        stats={heroData.stats}
        images={heroData.images}
      />
    </div>
  );
};

export default HeroSectionDemo;
