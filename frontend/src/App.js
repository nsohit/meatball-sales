import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return format(today, 'yyyy-MM-dd');
};

// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = getTodayDate();

  useEffect(() => {
    fetchDailySummary();
  }, []);

  const fetchDailySummary = async () => {
    try {
      const response = await axios.get(`${API}/daily-summary/${today}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Gagal memuat ringkasan harian');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Memuat...</div>;
  }

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan penjualan hari ini - {format(new Date(), 'd MMMM yyyy', { locale: localeId })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="revenue-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-revenue">{formatCurrency(summary?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Paket: {formatCurrency(summary?.package_revenue || 0)} | Minuman: {formatCurrency(summary?.beverage_revenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="profit-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="net-profit">{formatCurrency(summary?.net_profit || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Biaya produksi: {formatCurrency(summary?.total_production_cost || 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="bonus-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Karyawan</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="employee-bonus">{formatCurrency(summary?.employee_bonus || 0)}</div>
            <p className="text-xs text-muted-foreground">
              5% dari laba bersih (maks. Rp 10.000)
            </p>
          </CardContent>
        </Card>

        <Card data-testid="transactions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="transaction-count">{(summary?.package_count || 0) + (summary?.beverage_count || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Paket: {summary?.package_count || 0} | Minuman: {summary?.beverage_count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Kelola stok dan transaksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/stok')}
              data-testid="quick-manage-stock-btn"
            >
              Kelola Stok Bakso
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/transaksi')}
              data-testid="quick-add-beverage-btn"
            >
              Tambah Minuman
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/laporan')}
              data-testid="view-reports-btn"
            >
              Lihat Laporan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biaya Tetap Harian</CardTitle>
            <CardDescription>Biaya operasional per hari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sewa</span>
              <span className="text-sm font-medium">{formatCurrency(150000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gaji Karyawan</span>
              <span className="text-sm font-medium">{formatCurrency(60000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gaji Owner</span>
              <span className="text-sm font-medium">{formatCurrency(50000)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-semibold">{formatCurrency(260000)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Transaction Paket Component
const TransactionPaketPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [packagePrice, setPackagePrice] = useState('');
  const [packageQuantity, setPackageQuantity] = useState('1');
  const [extraItems, setExtraItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const packagePrices = [5000, 7000, 10000, 12000, 13000, 15000];
  
  const availableExtras = [
    { name: 'Bakso urat', prices: [{ pcs: 1, price: 2000 }] },
    { name: 'Bakso kecil', prices: [{ pcs: 1, price: 500 }, { pcs: 2, price: 1000 }, { pcs: 4, price: 2000 }] },
    { name: 'Tahu', prices: [{ pcs: 1, price: 500 }, { pcs: 2, price: 1000 }] },
    { name: 'Somay', prices: [{ pcs: 1, price: 500 }, { pcs: 2, price: 1000 }] },
    { name: 'Pangsit malang', prices: [{ pcs: 1, price: 500 }, { pcs: 2, price: 1000 }] },
    { name: 'Soun', prices: [{ pcs: 1, price: 500 }, { pcs: 2, price: 1000 }] },
  ];

  const addExtraItem = (itemName, pcs, price) => {
    setExtraItems([...extraItems, { item_name: itemName, quantity: pcs, price: price }]);
  };

  const removeExtraItem = (index) => {
    setExtraItems(extraItems.filter((_, i) => i !== index));
  };

  const calculateExtraTotal = () => {
    return extraItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!packagePrice) {
      toast.error('Pilih harga paket');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/transactions/package`, {
        date: selectedDate,
        package_price: parseFloat(packagePrice),
        quantity: parseInt(packageQuantity),
        extra_items: extraItems,
      });
      toast.success('Transaksi paket berhasil dicatat');
      setPackagePrice('');
      setPackageQuantity('1');
      setExtraItems([]);
    } catch (error) {
      console.error('Error creating package transaction:', error);
      toast.error('Gagal mencatat transaksi paket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="transaction-paket-page">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transaksi Paket Bakso</h2>
        <p className="text-muted-foreground">Catat penjualan paket dengan tambahan kondimen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            data-testid="paket-date-input"
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Paket Bakso</CardTitle>
            <CardDescription>Pilih harga paket dasar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Harga Paket</Label>
              <Select value={packagePrice} onValueChange={setPackagePrice}>
                <SelectTrigger data-testid="paket-price-select">
                  <SelectValue placeholder="Pilih harga paket" />
                </SelectTrigger>
                <SelectContent>
                  {packagePrices.map((price) => (
                    <SelectItem key={price} value={price.toString()}>
                      {formatCurrency(price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah Paket</Label>
              <Input
                type="number"
                min="1"
                value={packageQuantity}
                onChange={(e) => setPackageQuantity(e.target.value)}
                placeholder="Berapa paket?"
                data-testid="paket-quantity-input"
              />
            </div>

            {packagePrice && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold">
                  Subtotal Paket: {parseInt(packageQuantity)} × {formatCurrency(parseFloat(packagePrice))} = {formatCurrency(parseFloat(packagePrice) * parseInt(packageQuantity))}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tambah Kondimen</CardTitle>
            <CardDescription>Tambahkan item ekstra ke paket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableExtras.map((extra) => (
              <div key={extra.name} className="border-b pb-3">
                <p className="font-medium mb-2">{extra.name}</p>
                <div className="flex flex-wrap gap-2">
                  {extra.prices.map((option) => (
                    <Button
                      key={`${extra.name}-${option.pcs}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addExtraItem(extra.name, option.pcs, option.price)}
                      data-testid={`add-extra-${extra.name.replace(' ', '-')}-${option.pcs}`}
                    >
                      +{option.pcs} pcs ({formatCurrency(option.price)})
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {extraItems.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Item Tambahan:</h4>
                <div className="space-y-2">
                  {extraItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{item.item_name} × {item.quantity} pcs</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtraItem(index)}
                          data-testid={`remove-extra-${index}`}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Tambahan:</span>
                  <span className="text-green-600">{formatCurrency(calculateExtraTotal())}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {packagePrice && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Subtotal Paket:</span>
                  <span>{formatCurrency(parseFloat(packagePrice) * parseInt(packageQuantity))}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total Tambahan:</span>
                  <span>{formatCurrency(calculateExtraTotal())}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>TOTAL:</span>
                  <span className="text-green-600">
                    {formatCurrency(parseFloat(packagePrice) * parseInt(packageQuantity) + calculateExtraTotal())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg" data-testid="submit-paket-btn">
          {loading ? 'Menyimpan...' : 'Simpan Transaksi Paket'}
        </Button>
      </form>
    </div>
  );
};

// Transaction Component (Minuman saja)
const TransactionPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [beverageType, setBeverageType] = useState('Teh rosela');
  const [beverageQuantity, setBeverageQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBeverageSubmit = async (e) => {
    e.preventDefault();
    if (!beverageQuantity || beverageQuantity <= 0) {
      toast.error('Masukkan jumlah minuman');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/transactions/beverage`, {
        date: selectedDate,
        product_name: beverageType,
        quantity: parseInt(beverageQuantity),
      });
      toast.success('Transaksi minuman berhasil dicatat');
      setBeverageQuantity('');
    } catch (error) {
      console.error('Error creating beverage transaction:', error);
      toast.error('Gagal mencatat transaksi minuman');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="transaction-page">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Input Transaksi Minuman</h2>
        <p className="text-muted-foreground">Catat penjualan minuman (Paket bakso dikelola di menu Stok)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            data-testid="transaction-date-input"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Minuman</CardTitle>
          <CardDescription>Input penjualan minuman</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBeverageSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Minuman</Label>
              <Select value={beverageType} onValueChange={setBeverageType}>
                <SelectTrigger data-testid="beverage-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teh rosela" data-testid="beverage-teh-rosela">Teh Rosela - Rp 5.000</SelectItem>
                  <SelectItem value="Es teh manis" data-testid="beverage-es-teh">Es Teh Manis - Rp 3.000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                min="1"
                value={beverageQuantity}
                onChange={(e) => setBeverageQuantity(e.target.value)}
                placeholder="Masukkan jumlah"
                data-testid="beverage-quantity-input"
              />
            </div>

            {beverageQuantity && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold">
                  Total: {formatCurrency(
                    (beverageType === 'Teh rosela' ? 5000 : 3000) * parseInt(beverageQuantity)
                  )}
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" data-testid="submit-beverage-btn">
              {loading ? 'Menyimpan...' : 'Simpan Transaksi Minuman'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Reports Component
const ReportsPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [summary, setSummary] = useState(null);
  const [packageTxns, setPackageTxns] = useState([]);
  const [beverageTxns, setBeverageTxns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [summaryRes, packageRes, beverageRes] = await Promise.all([
        axios.get(`${API}/daily-summary/${selectedDate}`),
        axios.get(`${API}/transactions/package/${selectedDate}`),
        axios.get(`${API}/transactions/beverage/${selectedDate}`),
      ]);
      setSummary(summaryRes.data);
      setPackageTxns(packageRes.data);
      setBeverageTxns(beverageRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await axios.delete(`${API}/transactions/package/${id}`);
      toast.success('Transaksi berhasil dihapus');
      fetchReports();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Gagal menghapus transaksi');
    }
  };

  const handleDeleteBeverage = async (id) => {
    try {
      await axios.delete(`${API}/transactions/beverage/${id}`);
      toast.success('Transaksi berhasil dihapus');
      fetchReports();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Gagal menghapus transaksi');
    }
  };

  const handleExportDaily = () => {
    window.open(`${API}/export/daily/${selectedDate}`, '_blank');
    toast.success('File Excel sedang diunduh...');
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Harian</h2>
          <p className="text-muted-foreground">Detail transaksi dan ringkasan</p>
        </div>
        <Button onClick={handleExportDaily} variant="outline" data-testid="export-daily-btn">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            data-testid="report-date-input"
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Memuat laporan...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.total_revenue || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Laba Bersih</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.net_profit || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bonus Karyawan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.employee_bonus || 0)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Paket ({packageTxns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {packageTxns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Tidak ada transaksi paket</p>
                ) : (
                  <div className="space-y-3">
                    {packageTxns.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid="package-transaction-item">
                        <div>
                          <p className="font-semibold">
                            {txn.quantity} paket × {formatCurrency(txn.package_price)} = {formatCurrency(txn.revenue)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Biaya produksi: {formatCurrency(txn.total_production_cost)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePackage(txn.id)}
                          data-testid="delete-package-btn"
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Minuman ({beverageTxns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {beverageTxns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Tidak ada transaksi minuman</p>
                ) : (
                  <div className="space-y-3">
                    {beverageTxns.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid="beverage-transaction-item">
                        <div>
                          <p className="font-semibold">{txn.product_name} x {txn.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(txn.total_price)} | Biaya: {formatCurrency(txn.total_production_cost)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBeverage(txn.id)}
                          data-testid="delete-beverage-btn"
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Monthly Report Component
const MonthlyReportPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlySummary();
  }, [year, month]);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/monthly-summary/${year}/${month}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      toast.error('Gagal memuat laporan bulanan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMonthly = () => {
    window.open(`${API}/export/monthly/${year}/${month}`, '_blank');
    toast.success('File Excel sedang diunduh...');
  };

  return (
    <div className="space-y-6" data-testid="monthly-report-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Bulanan</h2>
          <p className="text-muted-foreground">Ringkasan penjualan per bulan</p>
        </div>
        {summary && (
          <Button onClick={handleExportMonthly} variant="outline" data-testid="export-monthly-btn">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Periode</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Tahun</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
              data-testid="year-input"
            />
          </div>
          <div className="flex-1">
            <Label>Bulan</Label>
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
              <SelectTrigger data-testid="month-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {format(new Date(2024, m - 1, 1), 'MMMM', { locale: localeId })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Memuat laporan...</div>
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Biaya Produksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_production_cost)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Laba Bersih</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_net_profit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Bonus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_employee_bonus)}</div>
                <p className="text-xs text-muted-foreground mt-1">Bonus karyawan bulan ini</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Harian ({summary.days_count} hari)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {summary.daily_summaries.map((daily) => (
                    <div key={daily.date} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{format(new Date(daily.date), 'd MMMM yyyy', { locale: localeId })}</span>
                        <span className="text-sm font-medium">{formatCurrency(daily.total_revenue)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Laba: {formatCurrency(daily.net_profit)}</div>
                        <div>Bonus: {formatCurrency(daily.employee_bonus)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Tidak ada data untuk periode ini</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Stock Management Component
const StockManagementPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [stock, setStock] = useState(null);
  const [showInitialForm, setShowInitialForm] = useState(false);
  const [showRemainingForm, setShowRemainingForm] = useState(false);
  const [editMode, setEditMode] = useState({ initial: false, remaining: false });
  const [loading, setLoading] = useState(false);
  
  // Initial stock form
  const [initialStock, setInitialStock] = useState({
    bakso_urat: '',
    bakso_kecil: '',
    tahu: '',
    somay: '',
    pangsit_malang: '',
    soun: ''
  });
  
  // Remaining stock form
  const [remainingStock, setRemainingStock] = useState({
    bakso_urat: '',
    bakso_kecil: '',
    tahu: '',
    somay: '',
    pangsit_malang: '',
    soun: ''
  });

  useEffect(() => {
    fetchStock();
  }, [selectedDate]);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${API}/stock/${selectedDate}`);
      setStock(response.data);
      setShowInitialForm(false);
      setShowRemainingForm(!response.data.stock_remaining);
      setEditMode({ initial: false, remaining: false });
    } catch (error) {
      if (error.response?.status === 404) {
        setStock(null);
        setShowInitialForm(true);
        setShowRemainingForm(false);
        setEditMode({ initial: false, remaining: false });
      }
    }
  };

  const handleEditInitial = () => {
    if (stock && stock.stock_brought) {
      setInitialStock({
        bakso_urat: stock.stock_brought.bakso_urat,
        bakso_kecil: stock.stock_brought.bakso_kecil,
        tahu: stock.stock_brought.tahu,
        somay: stock.stock_brought.somay,
        pangsit_malang: stock.stock_brought.pangsit_malang,
        soun: stock.stock_brought.soun
      });
      setEditMode({ ...editMode, initial: true });
    }
  };

  const handleEditRemaining = () => {
    if (stock && stock.stock_remaining) {
      setRemainingStock({
        bakso_urat: stock.stock_remaining.bakso_urat,
        bakso_kecil: stock.stock_remaining.bakso_kecil,
        tahu: stock.stock_remaining.tahu,
        somay: stock.stock_remaining.somay,
        pangsit_malang: stock.stock_remaining.pangsit_malang,
        soun: stock.stock_remaining.soun
      });
      setEditMode({ ...editMode, remaining: true });
    }
  };

  const handleCancelEdit = () => {
    setEditMode({ initial: false, remaining: false });
    setInitialStock({
      bakso_urat: '',
      bakso_kecil: '',
      tahu: '',
      somay: '',
      pangsit_malang: '',
      soun: ''
    });
    setRemainingStock({
      bakso_urat: '',
      bakso_kecil: '',
      tahu: '',
      somay: '',
      pangsit_malang: '',
      soun: ''
    });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode.initial) {
        // Update existing
        await axios.put(`${API}/stock/initial/${selectedDate}`, {
          date: selectedDate,
          ...initialStock
        });
        toast.success('Stok awal berhasil diupdate');
      } else {
        // Create new
        await axios.post(`${API}/stock/initial`, {
          date: selectedDate,
          ...initialStock
        });
        toast.success('Stok awal berhasil dicatat');
      }
      setInitialStock({
        bakso_urat: '',
        bakso_kecil: '',
        tahu: '',
        somay: '',
        pangsit_malang: '',
        soun: ''
      });
      fetchStock();
    } catch (error) {
      console.error('Error saving initial stock:', error);
      toast.error(error.response?.data?.detail || 'Gagal menyimpan stok awal');
    } finally {
      setLoading(false);
    }
  };

  const handleRemainingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/stock/remaining/${selectedDate}`, remainingStock);
      toast.success(editMode.remaining ? 'Stok sisa berhasil diupdate' : 'Stok sisa berhasil dicatat');
      setRemainingStock({
        bakso_urat: '',
        bakso_kecil: '',
        tahu: '',
        somay: '',
        pangsit_malang: '',
        soun: ''
      });
      fetchStock();
    } catch (error) {
      console.error('Error updating remaining stock:', error);
      toast.error(error.response?.data?.detail || 'Gagal menyimpan stok sisa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async () => {
    if (!window.confirm('Hapus data stok untuk tanggal ini?')) return;
    try {
      await axios.delete(`${API}/stock/${selectedDate}`);
      toast.success('Stok berhasil dihapus');
      fetchStock();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Gagal menghapus stok');
    }
  };

  const handleExportStock = () => {
    window.open(`${API}/export/stock/${selectedDate}`, '_blank');
    toast.success('File Excel sedang diunduh...');
  };

  const stockItems = [
    { key: 'bakso_urat', label: 'Bakso Urat' },
    { key: 'bakso_kecil', label: 'Bakso Kecil' },
    { key: 'tahu', label: 'Tahu' },
    { key: 'somay', label: 'Somay' },
    { key: 'pangsit_malang', label: 'Pangsit Malang' },
    { key: 'soun', label: 'Soun' }
  ];

  return (
    <div className="space-y-6" data-testid="stock-management-page">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Stok</h2>
        <p className="text-muted-foreground">Input stok barang yang dibawa dan sisa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            data-testid="stock-date-input"
          />
        </CardContent>
      </Card>

      {showInitialForm && (
        <Card>
          <CardHeader>
            <CardTitle>Input Stok Awal Hari Ini</CardTitle>
            <CardDescription>Catat barang yang dibawa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stockItems.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label>{item.label}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={initialStock[item.key]}
                      onChange={(e) => setInitialStock({ ...initialStock, [item.key]: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      data-testid={`initial-${item.key}`}
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={loading} className="w-full" data-testid="submit-initial-stock-btn">
                {loading ? 'Menyimpan...' : 'Simpan Stok Awal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stock && !stock.stock_remaining && showRemainingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Input Stok Sisa</CardTitle>
            <CardDescription>Catat sisa barang yang dibawa pulang (Pangsit & Soun harus habis)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRemainingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stockItems.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label>
                      {item.label}
                      {(item.key === 'pangsit_malang' || item.key === 'soun') && (
                        <span className="text-xs text-red-500 ml-1">(Tidak dibawa pulang)</span>
                      )}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={remainingStock[item.key]}
                      onChange={(e) => setRemainingStock({ ...remainingStock, [item.key]: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      data-testid={`remaining-${item.key}`}
                      disabled={item.key === 'pangsit_malang' || item.key === 'soun'}
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={loading} className="w-full" data-testid="submit-remaining-stock-btn">
                {loading ? 'Menyimpan...' : 'Simpan Stok Sisa'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stock && !editMode.initial && !editMode.remaining && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Data Stok Hari Ini</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportStock} data-testid="export-stock-btn">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditInitial} data-testid="edit-initial-btn">
                  Edit Stok Awal
                </Button>
                {stock.stock_remaining && (
                  <Button variant="outline" size="sm" onClick={handleEditRemaining} data-testid="edit-remaining-btn">
                    Edit Stok Sisa
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleDeleteStock} data-testid="delete-stock-btn">
                  Hapus
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Stok Awal (Bawaan):</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {stockItems.map((item) => (
                  <div key={item.key} className="flex justify-between p-2 bg-muted rounded">
                    <span>{item.label}:</span>
                    <span className="font-semibold">{stock.stock_brought[item.key]}</span>
                  </div>
                ))}
              </div>
            </div>

            {stock.stock_remaining && (
              <>
                <div>
                  <h4 className="font-semibold mb-2">Stok Sisa:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {stockItems.map((item) => (
                      <div key={item.key} className="flex justify-between p-2 bg-muted rounded">
                        <span>{item.label}:</span>
                        <span className="font-semibold text-green-600">{stock.stock_remaining[item.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {editMode.initial && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Stok Awal</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Batal</Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stockItems.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label>{item.label}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={initialStock[item.key]}
                      onChange={(e) => setInitialStock({ ...initialStock, [item.key]: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {editMode.remaining && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Stok Sisa</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Batal</Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRemainingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stockItems.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label>
                      {item.label}
                      {(item.key === 'pangsit_malang' || item.key === 'soun') && (
                        <span className="text-xs text-red-500 ml-1">(Tidak dibawa pulang)</span>
                      )}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={remainingStock[item.key]}
                      onChange={(e) => setRemainingStock({ ...remainingStock, [item.key]: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      disabled={item.key === 'pangsit_malang' || item.key === 'soun'}
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stock && stock.stock_remaining && !editMode.initial && !editMode.remaining && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Rekap Stok Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2">Bawaan</th>
                      <th className="text-right p-2">Sisa</th>
                      <th className="text-right p-2">Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map((item) => (
                      <tr key={item.key} className="border-b">
                        <td className="p-2 font-medium">{item.label}</td>
                        <td className="text-right p-2">{stock.stock_brought[item.key]}</td>
                        <td className="text-right p-2 text-green-600">
                          {stock.stock_remaining[item.key]}
                          {(item.key === 'pangsit_malang' || item.key === 'soun') && stock.stock_remaining[item.key] === 0 && (
                            <span className="text-xs ml-1">✓</span>
                          )}
                        </td>
                        <td className="text-right p-2 text-blue-600 font-semibold">{stock.stock_sold?.[item.key] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Pendapatan dari Paket Bakso:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(stock.revenue_from_stock || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Biaya Produksi:</span>
                  <span>{formatCurrency(stock.production_cost_from_stock || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Laba Kotor:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency((stock.revenue_from_stock || 0) - (stock.production_cost_from_stock || 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Harga Jual & Biaya Produksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-2">Harga Jual:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Bakso Urat: Rp 2.000</li>
                    <li>• Bakso Kecil: Rp 1.000</li>
                    <li>• Tahu: Rp 1.000</li>
                    <li>• Somay: Rp 1.000</li>
                    <li>• Pangsit: Rp 1.000</li>
                    <li>• Soun: Rp 1.000</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Biaya Produksi:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Bakso Urat: Rp 1.300</li>
                    <li>• Lainnya: Rp 650</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-xs"><strong>Catatan:</strong> Pendapatan dihitung otomatis = (Bawaan - Sisa) × Harga Jual</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!stock && !showInitialForm && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Tidak ada data stok untuk tanggal ini</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main App Layout
const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Bakso Business</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/" data-testid="nav-dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/transaksi-paket" data-testid="nav-transaksi-paket">Transaksi Paket</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/transaksi" data-testid="nav-transaksi">Transaksi Minuman</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/stok" data-testid="nav-stok">Stok</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/laporan" data-testid="nav-laporan">Laporan</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/laporan-bulanan" data-testid="nav-laporan-bulanan">Bulanan</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/transaksi-paket" element={<Layout><TransactionPaketPage /></Layout>} />
          <Route path="/transaksi" element={<Layout><TransactionPage /></Layout>} />
          <Route path="/stok" element={<Layout><StockManagementPage /></Layout>} />
          <Route path="/laporan" element={<Layout><ReportsPage /></Layout>} />
          <Route path="/laporan-bulanan" element={<Layout><MonthlyReportPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;