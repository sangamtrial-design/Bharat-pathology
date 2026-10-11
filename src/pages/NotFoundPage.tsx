import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100 font-extrabold text-2xl">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('Page Not Found', 'पृष्ठ नहीं मिला')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            {t(
              'The page you are looking for does not exist or may have been moved. Return to the Bharat Pathology home page below.',
              'आप जिस पृष्ठ की तलाश कर रहे हैं वह उपलब्ध नहीं है। मुख्य पृष्ठ पर लौटने के लिए नीचे दिए गए बटन पर क्लिक करें।'
            )}
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>{t('Back to Homepage', 'मुख्य पृष्ठ पर लौटें')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
