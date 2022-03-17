import styles from './PostBody.module.css';
import MDXRenderer from '~/components/blog/MDXRenderer';

const PostBody: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className={`text-lg ${styles['PostBody']}`}>
      <MDXRenderer code={content} />
    </div>
  );
};

export default PostBody;
