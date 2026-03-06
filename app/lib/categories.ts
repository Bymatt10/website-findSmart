// Maps category names to Lucide icon names and colors
export const CATEGORY_COLORS: Record<string, string> = {
    'Alimentación': '#f97316',
    'Transporte': '#3b82f6',
    'Vivienda': '#8b5cf6',
    'Entretenimiento': '#ec4899',
    'Salud': '#10b981',
    'Educación': '#06b6d4',
    'Ropaa': '#f43f5e',
    'Servicios': '#eab308',
    'Delivery': '#f59e0b',
    'Café': '#a16207',
    'Supermercado': '#22c55e',
    'Transferencias': '#6366f1',
    'Otros': '#71717a',
};

export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || '#818cf8';
}
