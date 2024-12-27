export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    
    if (n < 20) return teens[n - 10];
    
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  }

  if (num === 0) return 'Zero';

  let words = '';
  let chunk = 0;

  // Handle millions
  chunk = Math.floor(num / 1000000);
  if (chunk > 0) {
    words += convertLessThanThousand(chunk) + ' Million ';
    num %= 1000000;
  }

  // Handle thousands
  chunk = Math.floor(num / 1000);
  if (chunk > 0) {
    words += convertLessThanThousand(chunk) + ' Thousand ';
    num %= 1000;
  }

  // Handle remaining numbers
  if (num > 0) {
    words += convertLessThanThousand(num);
  }

  return words.trim();
} 