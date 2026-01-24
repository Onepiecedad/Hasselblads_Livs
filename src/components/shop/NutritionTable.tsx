import { NutritionData } from "@/lib/products";

interface NutritionTableProps {
    data: NutritionData;
}

export const NutritionTable = ({ data }: NutritionTableProps) => {
    return (
        <table className="w-full text-[10px] mt-1">
            <thead>
                <tr className="border-b border-gray-200">
                    <th className="text-left py-1 font-medium text-gray-600">
                        {data.servingSize || 'per 100g'}
                    </th>
                    <th className="text-right py-1"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.energy && (
                    <tr>
                        <td className="py-0.5">Energi</td>
                        <td className="text-right font-medium">
                            {data.energy.kcal} kcal / {data.energy.kj} kJ
                        </td>
                    </tr>
                )}
                {data.fat !== undefined && (
                    <tr>
                        <td className="py-0.5">Fett</td>
                        <td className="text-right">{data.fat}g</td>
                    </tr>
                )}
                {data.saturatedFat !== undefined && (
                    <tr>
                        <td className="py-0.5 pl-2 text-gray-500">varav mättat</td>
                        <td className="text-right text-gray-500">{data.saturatedFat}g</td>
                    </tr>
                )}
                {data.carbohydrates !== undefined && (
                    <tr>
                        <td className="py-0.5">Kolhydrater</td>
                        <td className="text-right">{data.carbohydrates}g</td>
                    </tr>
                )}
                {data.sugars !== undefined && (
                    <tr>
                        <td className="py-0.5 pl-2 text-gray-500">varav sockerarter</td>
                        <td className="text-right text-gray-500">{data.sugars}g</td>
                    </tr>
                )}
                {data.fiber !== undefined && (
                    <tr>
                        <td className="py-0.5">Fiber</td>
                        <td className="text-right">{data.fiber}g</td>
                    </tr>
                )}
                {data.protein !== undefined && (
                    <tr>
                        <td className="py-0.5">Protein</td>
                        <td className="text-right">{data.protein}g</td>
                    </tr>
                )}
                {data.salt !== undefined && (
                    <tr>
                        <td className="py-0.5">Salt</td>
                        <td className="text-right">{data.salt}g</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default NutritionTable;
