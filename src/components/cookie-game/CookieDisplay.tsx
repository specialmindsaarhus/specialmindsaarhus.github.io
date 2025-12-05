interface CookieDisplayProps {
  shape: string;
  icing: string;
  sprinkles: boolean;
  size?: "sm" | "md" | "lg";
}

export function CookieDisplay({ shape, icing, sprinkles, size = "md" }: CookieDisplayProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const getShapeEmoji = () => {
    switch (shape) {
      case "star": return "⭐";
      case "circle": return "🟤";
      case "tree": return "🎄";
      default: return "🍪";
    }
  };

  const getIcingColor = () => {
    switch (icing) {
      case "red": return "bg-red-200 border-red-300";
      case "green": return "bg-green-200 border-green-300";
      case "blue": return "bg-blue-200 border-blue-300";
      case "yellow": return "bg-yellow-200 border-yellow-300";
      case "pink": return "bg-pink-200 border-pink-300";
      default: return "bg-amber-100 border-amber-200";
    }
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full border-2 ${getIcingColor()}`}>
      <span className="text-lg">{getShapeEmoji()}</span>
      {sprinkles && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-pink-500 rounded-full absolute top-2 left-3"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-3 right-2"></div>
          <div className="w-1 h-1 bg-yellow-500 rounded-full absolute bottom-3 left-2"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full absolute bottom-2 right-3"></div>
        </div>
      )}
    </div>
  );
}
