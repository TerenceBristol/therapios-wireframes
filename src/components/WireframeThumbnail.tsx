import Image from 'next/image';
import Link from 'next/link';

interface WireframeThumbnailProps {
  title: string;
  description: string;
  imagePath: string;
  link: string;
}

export default function WireframeThumbnail({ title, description, imagePath, link }: WireframeThumbnailProps) {
  return (
    <Link href={link} className="group">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="relative h-48 w-full">
          <Image
            src={imagePath}
            alt={`${title} wireframe thumbnail`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
} 