import '../styles/animations.css'

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" aria-busy="true" aria-label="Yükleniyor">
      {/* Image placeholder */}
      <div className="w-full h-44 sm:h-52 animate-shimmer" />

      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-5 w-3/4 rounded-lg animate-shimmer" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-md animate-shimmer" />
          <div className="h-3.5 w-5/6 rounded-md animate-shimmer" />
        </div>

        {/* Impact badge */}
        <div className="h-12 w-full rounded-xl animate-shimmer" />

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-1/4 rounded animate-shimmer" />
            <div className="h-3 w-1/6 rounded animate-shimmer" />
          </div>
          <div className="h-2.5 w-full rounded-full animate-shimmer" />
        </div>

        {/* Button */}
        <div className="pt-1">
          <div className="h-12 w-full rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
