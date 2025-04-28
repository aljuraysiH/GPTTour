import Link from "next/link";

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-primary">TourGPT</h1>
          <p className="py-6 text-lg leading-loose">
            TourGPT: المساعد الذكي لرحلاتك. سجل دخول للدردشة مع الذكاء الاصطناعي، استكشف المدن بتفاصيل سياحية مخصصة
          </p>
          <Link href="/chat" className="btn btn-secondary ">
            ابدا الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
