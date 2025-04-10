type HeadingProps = {
  title: string;
  description?: string;
};
export default function Heading({ title, description }: HeadingProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}
