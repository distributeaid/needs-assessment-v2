import { Text } from "@radix-ui/themes";

interface PageTitleProps {
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  return (
    <Text
      as="div"
      role="heading"
      aria-level={1}
      className="text-2xl font-extrabold text-blue-900 mb-6 text-center tracking-wide uppercase"
    >
      {title}
    </Text>
  );
}
