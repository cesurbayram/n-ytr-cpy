interface IOMessage {
    // IO mesajı için uygun alanları tanımlayabilirsiniz
    [key: string]: any; // Dinamik yapı için
  }
  
  const ioTransaction = async (message: IOMessage): Promise<void> => {
    // IO işlemleri burada yapılacak
    console.log('IO verisi işleniyor:', message);
  };
  
  export default ioTransaction;
  