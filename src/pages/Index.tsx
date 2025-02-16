
import { useState } from "react";
import { Search, Wallet, Lock, ArrowUpRight, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const Index = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Vui lòng nhập địa chỉ ví");
      return;
    }
    setIsLoading(true);
    // Simulated loading state
    setTimeout(() => setIsLoading(false), 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  const transactions = [
    {
      id: "00000000...0195",
      amount: "571.57 PI",
      asset: "Pi",
      updatedAt: "21:36:35 21/5/2023",
      unlockTime: "Chưa xác định",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4 fade-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Pi Network Balance Viewer
        </h1>
        <p className="text-muted-foreground">
          Xem thông tin chi tiết về số dư và số Pi đang bị khóa trên Pi Network
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-3xl mx-auto space-y-4 fade-in">
        <div className="relative">
          <Input
            type="text"
            placeholder="Nhập địa chỉ ví Pi của bạn"
            className="pl-10 h-12"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
        </div>
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isLoading}
        >
          {isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
        </Button>
      </form>

      <div className="grid md:grid-cols-2 gap-6 fade-in">
        <div className="glass-card rounded-lg p-6 space-y-2">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Wallet className="h-5 w-5" />
            <span>Số Dư Hiện Tại</span>
          </div>
          <div className="balance-number">9.37 PI</div>
          <p className="text-sm text-muted-foreground">Số Pi khả dụng trong ví</p>
        </div>

        <div className="glass-card rounded-lg p-6 space-y-2">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span>Tổng Số Dư Đang Bị Khóa</span>
          </div>
          <div className="balance-number">571.57 PI</div>
          <p className="text-sm text-muted-foreground">
            Tổng số Pi đang trong thời gian khóa
          </p>
        </div>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span>Danh Sách Số Dư Đang Bị Khóa</span>
          </div>
          <Button variant="outline" size="icon">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Giao Dịch</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Tài Sản</TableHead>
                <TableHead>Thời Gian Cập Nhật</TableHead>
                <TableHead>Thời Gian Mở Khóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{tx.id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(tx.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.asset}</TableCell>
                  <TableCell>{tx.updatedAt}</TableCell>
                  <TableCell>{tx.unlockTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Index;
