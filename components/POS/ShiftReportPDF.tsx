import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }
});

interface ShiftReportPDFProps {
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime?: string;
  };
  sales: Array<{
    id: string;
    productName: string;
    qty: number;
    salePrice: number;
    customerName: string;
    paymentMethod: string;
  }>;
  totalSales: number;
  totalItems: number;
  uniqueCustomers: number;
  salesByPaymentMethod: Record<string, number>;
  salesByOrder: Record<string, any>;
  sortedProducts: Array<[string, { qty: number; total: number; avgPrice: number }]>;
}

export function ShiftReportPDF({
  shift,
  totalSales,
  totalItems,
  salesByPaymentMethod,
}: ShiftReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Shift Report</Text>
        <View style={styles.section}>
          <Text>Cashier: {shift.name}</Text>
          <Text>Total Sales: {formatCurrency(totalSales)}</Text>
          <Text>Items Sold: {totalItems}</Text>
        </View>
        <View style={styles.section}>
          <Text>Payment Methods:</Text>
          {Object.entries(salesByPaymentMethod).map(([method, amount]) => (
            <View key={method} style={styles.row}>
              <Text>{method}</Text>
              <Text>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
} 