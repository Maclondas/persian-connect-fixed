import React, { useEffect, useState } from 'react';
import { SEOMeta } from './components/seo-head';
import { HomePage } from './components/homepage';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { PostAdPage } from './components/post-ad-page';
import { AdDetailPage } from './components/ad-detail-page';

function getPage(): string {
try {
const url = new URL(window.location.href);
return url.searchParams.get('page') ?? 'home';
} catch {
return 'home';
}
}

export default function App() {
const [page, setPage] = useState<string>(getPage());

useEffect(() => {
const onChange = () => setPage(getPage());
window.addEventListener('popstate', onChange);
window.addEventListener('hashchange', onChange);
return () => {
window.removeEventListener('popstate', onChange);
window.removeEventListener('hashchange', onChange);
};
}, []);

return (
<>
<SEOMeta title="Persian Connect" />
{page === 'login' && <LoginPage />}
{page === 'signup' && <SignupPage />}
{page === 'post' && <PostAdPage />}
{page === 'ad' && <AdDetailPage />}
{(page !== 'login' && page !== 'signup' && page !== 'post' && page !== 'ad') && <HomePage />}
</>
);
}
