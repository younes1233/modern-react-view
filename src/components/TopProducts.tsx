
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const products = [
  {
    name: "Wireless Headphones",
    category: "Electronics",
    sales: 1234,
    revenue: "$98,720",
    trend: "up",
    trendValue: "+12.5%",
    trending: true
  },
  {
    name: "Smart Watch",
    category: "Electronics", 
    sales: 987,
    revenue: "$78,960",
    trend: "up",
    trendValue: "+8.3%",
    hot: true
  },
  {
    name: "Bluetooth Speaker",
    category: "Electronics",
    sales: 756,
    revenue: "$45,360",
    trend: "down",
    trendValue: "-2.1%"
  },
  {
    name: "Phone Case",
    category: "Accessories",
    sales: 654,
    revenue: "$32,700",
    trend: "up",
    trendValue: "+5.7%"
  }
];

export function TopProducts() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-green-500 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">Top Products</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {products.map((product, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.trending && (
                      <Badge variant="destructive" className="text-xs px-2 py-1">
                        trending
                      </Badge>
                    )}
                    {product.hot && (
                      <Badge className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600">
                        hot
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {product.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      product.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {product.trendValue}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{product.sales} sales • {product.revenue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
