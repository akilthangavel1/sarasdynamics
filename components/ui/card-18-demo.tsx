import React from 'react';
import { BlogPostCard } from '@/components/ui/card-18';
import { motion } from 'framer-motion';

// Mock data for blog posts
const posts = [
  {
    tag: 'Trends',
    date: 'ON MAY 4, 2025',
    title: 'The Art of Digital Transformation: Turning Vision into Value',
    description: 'Explore real-world examples of businesses that reimagined their digital presence and achieved success.',
    href: '#',
  },
  {
    tag: 'Trends',
    date: 'ON MAY 4, 2025',
    title: 'Collaboration that Converts: Why the Right Agency Partnership Matters',
    description: 'Learn why aligning with the right creative partner can make or break your online success story.',
    href: '#',
  },
  {
    tag: 'Trends',
    date: 'ON JUN 17, 2025',
    title: 'User-Centered, Strategy-Driven: Designing for Impact in 2025',
    description: 'Unpack the latest trends in UX, SEO, and responsive design that are helping forward-thinking brands win.',
    href: '#',
  },
];

const featuredPost = {
    tag: 'Trends',
    date: 'ON JUL 13, 2025',
    title: 'From Concept to Clicks: How Strategy Fuels Great Web Design',
    description: 'Discover how a well-defined digital strategy transforms creative ideas into high-performing websites that engage users and drive traffic.',
    href: '#',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/03/03c7b1fa6166ecc3cfa69547197b6f0d6408819c8a99e9e1df1d0d593555fe61.jpg',
};

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Animation variants for child items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function BlogPostCardDemo({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-8 ${className}`}>
      {/* Featured Post */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-8 md:mb-12">
        <BlogPostCard
          variant="featured"
          {...featuredPost}
        />
      </motion.div>

      {/* Grid of Default Posts */}
      <motion.div 
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map((post, index) => (
          <motion.div key={index} variants={itemVariants}>
            <BlogPostCard {...post} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default BlogPostCardDemo;
