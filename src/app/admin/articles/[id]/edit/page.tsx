// page.tsx (Server Component)
import EditArticleClient from './EditArticleClient';

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  return <EditArticleClient id={params.id} />;
} 
