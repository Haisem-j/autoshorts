type Color = `normal` | 'custom';
type Size = `normal` | `small`;

const colorClasses = {
  normal: `ColorNormal`,
  custom: '',
};

const sizeClasses = {
  normal: `SizeNormal`,
  small: `SizeSmall`,
};

function getColorClasses(color?: Color) {
  return colorClasses[color || `normal`];
}

function getSizeClasses(size?: Size) {
  return sizeClasses[size || `normal`];
}

const Badge: React.FC<{
  color?: Color;
  size?: Size;
  className?: string;
}> = ({ children, color, size, className }) => {
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`Badge ${colorClasses} ${sizeClasses} ${className ?? ''}`}>
      {children}
    </div>
  );
};

export default Badge;
