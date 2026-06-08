import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, showBack = true, right }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between bg-white/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-charcoal" />
          </button>
        )}
        <h1 className="text-base font-semibold text-charcoal">{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </header>
  );
}
