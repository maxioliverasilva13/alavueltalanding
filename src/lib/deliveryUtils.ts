export type DeliveryFlags = {
  acepta_domicilio: boolean;
  acepta_retiro: boolean;
};

export type DeliveryItem = {
  acepta_domicilio?: boolean;
  acepta_retiro?: boolean;
};

export function getCompanyDeliveryDefaults(
  trabajoDomicilio?: boolean,
  trabajoLocal?: boolean,
): DeliveryFlags {
  const acepta_domicilio = trabajoDomicilio === true;
  const acepta_retiro = trabajoLocal === true;
  if (!acepta_domicilio && !acepta_retiro) {
    return { acepta_domicilio: true, acepta_retiro: false };
  }
  return { acepta_domicilio, acepta_retiro };
}

export function getDeliveryIntersection(items: DeliveryItem[]): {
  compatible: boolean;
  acepta_domicilio: boolean;
  acepta_retiro: boolean;
} {
  if (items.length === 0) {
    return { compatible: true, acepta_domicilio: true, acepta_retiro: true };
  }

  const acepta_domicilio = items.every((i) => i.acepta_domicilio !== false);
  const acepta_retiro = items.every((i) => i.acepta_retiro !== false);
  return {
    compatible: acepta_domicilio || acepta_retiro,
    acepta_domicilio,
    acepta_retiro,
  };
}

export function canAddDeliveryItem(
  existing: DeliveryItem[],
  candidate: DeliveryItem,
): boolean {
  if (existing.length === 0) return true;
  const { compatible } = getDeliveryIntersection([...existing, candidate]);
  return compatible;
}

export function defaultTipoEntrega(
  items: DeliveryItem[],
  company: DeliveryFlags,
): "domicilio" | "retiro" {
  const { acepta_domicilio, acepta_retiro } =
    items.length > 0 ? getDeliveryIntersection(items) : company;

  if (acepta_domicilio && !acepta_retiro) return "domicilio";
  if (acepta_retiro && !acepta_domicilio) return "retiro";
  return acepta_domicilio ? "domicilio" : "retiro";
}
