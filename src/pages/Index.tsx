
import { useState } from "react";
import { Search, Wallet, Lock, ArrowUpRight, Copy, Loader2 } from "lucide-react";
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

const API_KEY = "gsyrbyj4rfvvddmon30krlczn6ccdpnbshzrkxzklehn5uavnasjgkvc0lfgqjmp";
const BASE_URL = "https://api.mainnet.minepi.com";

const Index = () => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [claimableBalances, setClaimableBalances] = useState<any[]>([]);

  const convertToVietnamTime = (utcTimeStr: string) => {
    try {
      const utcDate = new Date(utcTimeStr);
      const vnTime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
      return vnTime.toLocaleString("vi-VN");
    } catch (e) {
      console.error("❌ Lỗi chuyển đổi thời gian:", e);
      return "Không xác định";
    }
  };

  const getBalance = async (walletAddress: string) => {
    try {
      const response = await fetch(`${BASE_URL}/accounts/${walletAddress}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      for (const balance of data.balances || []) {
        if (balance.asset_type === "native") {
          return parseFloat(balance.balance);
        }
      }
      return null;
    } catch (error) {
      console.error("❌ Lỗi lấy số dư:", error);
      return null;
    }
  };

  const getClaimableBalances = async (walletAddress: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/claimable_balances/?claimant=${walletAddress}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      const records = data._embedded?.records || [];

      return records.map((record: any) => {
        const lastModifiedTime = convertToVietnamTime(record.last_modified_time);
        let unlockTime = "Chưa xác định";
        let unlockDaysLeft = "N/A";

        for (const claimant of record.claimants) {
          if (claimant.destination === walletAddress) {
            const predicate = claimant.predicate;
            if (predicate.abs_before) {
              unlockTime = convertToVietnamTime(predicate.abs_before);
              const unlockDate = new Date(predicate.abs_before);
              const now = new Date();
              const daysLeft = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              unlockDaysLeft = daysLeft.toString();
            } else if (predicate.not?.abs_before) {
              unlockTime = convertToVietnamTime(predicate.not.abs_before);
              const unlockDate = new Date(predicate.not.abs_before);
              const now = new Date();
              const daysLeft = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              unlockDaysLeft = daysLeft.toString();
            }
          }
        }

        return {
          id: record.id,
          amount: record.amount,
          asset: "Pi",
          updatedAt: lastModifiedTime,
          unlockTime,
          unlockDaysLeft,
        };
      });
    } catch (error) {
      console.error("❌ Lỗi lấy số dư khóa:", error);
      return [];
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Vui lòng nhập địa chỉ ví");
      return;
    }
    
    setIsLoading(true);
    try {
      const [balanceResult, claimableResult] = await Promise.all([
        getBalance(address),
        getClaimableBalances(address),
      ]);

      setBalance(balanceResult);
      setClaimableBalances(claimableResult);

      if (balanceResult === null) {
        toast.error("Không thể lấy số dư hoặc ví không tồn tại!");
      }
    } catch (error) {
      console.error("❌ Lỗi tìm kiếm:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        <div className="text-center space-y-4 fade-in">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Pi Network Balance Viewer
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Xem thông tin chi tiết về số dư và số Pi đang bị khóa trên Pi Network
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-3xl mx-auto space-y-4 fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Nhập địa chỉ ví Pi của bạn"
                className="pr-10 h-12 text-base shadow-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tìm kiếm
                </>
              ) : (
                "Tìm kiếm"
              )}
            </Button>
          </div>
        </form>

        {(balance !== null || claimableBalances.length > 0) && (
          <>
            <div className="grid md:grid-cols-2 gap-6 fade-in">
              <div className="glass-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-lg font-medium">Số Dư Hiện Tại</span>
                </div>
                <div className="balance-number bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {balance?.toFixed(2) || "0.00"} PI
                </div>
                <p className="text-sm text-muted-foreground">Số Pi khả dụng trong ví</p>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-lg font-medium">Tổng Số Dư Đang Bị Khóa</span>
                </div>
                <div className="balance-number bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {claimableBalances
                    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
                    .toFixed(2)} PI
                </div>
                <p className="text-sm text-muted-foreground">Tổng số Pi đang trong thời gian khóa</p>
              </div>
            </div>

            {claimableBalances.length > 0 && (
              <div className="glass-card rounded-xl p-6 space-y-4 fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-medium">Danh Sách Số Dư Đang Bị Khóa</span>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-lg hover:bg-blue-50">
                    <ArrowUpRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="rounded-xl border shadow-sm overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Giao Dịch</TableHead>
                        <TableHead>Số Lượng</TableHead>
                        <TableHead>Tài Sản</TableHead>
                        <TableHead className="hidden md:table-cell">Thời Gian Cập Nhật</TableHead>
                        <TableHead className="hidden md:table-cell">Thời Gian Mở Khóa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimableBalances.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            <div className="flex items-center space-x-2">
                              <span className="truncate">{tx.id}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 hover:bg-blue-50"
                                onClick={() => copyToClipboard(tx.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{tx.amount} PI</TableCell>
                          <TableCell>{tx.asset}</TableCell>
                          <TableCell className="hidden md:table-cell">{tx.updatedAt}</TableCell>
                          <TableCell className="hidden md:table-cell">{tx.unlockTime}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
