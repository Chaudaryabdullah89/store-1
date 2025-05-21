import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiMessageSquare, FiShare2, FiClock, FiUser } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/blogs/${slug}`);
      setBlog(response.data);
      setComments(response.data.comments || []);
      fetchRelatedBlogs(response.data.category);
    } catch (err) {
      setError('Failed to fetch blog post');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blogs?category=${category}&limit=3`);
      setRelatedBlogs(response.data.blogs || response.data);
    } catch (err) {
      console.error('Error fetching related blogs:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setBlog(response.data);
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login or show login prompt
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/comments`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setComments(response.data.comments);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Blog not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Blog Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center">
            <FiUser className="mr-2" />
            <span>{blog.author?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-2" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FiMessageSquare className="mr-2" />
            <span>{comments.length} comments</span>
          </div>
        </div>
        {blog.featuredImage && (
          <img
            src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `https://apna-backend.vercel.app${blog.featuredImage}`}
            alt={blog.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
            onError={(e) => {
              console.error('Error loading image:', blog.featuredImage);
              e.target.src = '/placeholder-blog.jpg'; // Fallback image
            }}
          />
        )}
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="prose prose-lg max-w-none">
          {blog.content}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              blog.likes?.includes(user?._id)
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiHeart className={blog.likes?.includes(user?._id) ? 'fill-current' : ''} />
            <span>{blog.likes?.length || 0} Likes</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <FiShare2 />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Please <Link to="/login" className="text-blue-500 hover:underline">login</Link> to post a comment.
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{comment.user?.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs
              .filter((relatedBlog) => relatedBlog._id !== blog._id)
              .map((relatedBlog) => (
                <Link
                  key={relatedBlog._id}
                  to={`/blog/${relatedBlog.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48">
                    <img
                      src={relatedBlog.featuredImage || '/images/blog-placeholder.jpg'}
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{relatedBlog.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedBlog.excerpt}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail; 