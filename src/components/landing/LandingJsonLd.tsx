import type { LandingEmpresaData } from "@/lib/types";
import { buildLocalBusinessJsonLd } from "@/lib/seo";

type Props = {
  data: LandingEmpresaData;
};

/** Datos estructurados visibles para Google (no afectan el diseño). */
export default function LandingJsonLd({ data }: Props) {
  const jsonLd = buildLocalBusinessJsonLd(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
