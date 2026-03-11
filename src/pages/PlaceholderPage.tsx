interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="font-mincho text-xl text-ink dark:text-paper">{title}</h1>
        {description && (
          <p className="text-sm text-ash font-gothic">{description}</p>
        )}
        <p className="text-xs text-ash/60 font-gothic mt-4">実装予定</p>
      </div>
    </div>
  )
}
