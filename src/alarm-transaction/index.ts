interface AlarmMessage {
    // Alarm mesajı için uygun alanları tanımlayabilirsiniz
    [key: string]: any; // Dinamik yapı için
  }
  
  const alarmTransaction = async (message: AlarmMessage): Promise<void> => {
    // Alarm işlemleri burada yapılacak
    console.log('Alarm verisi işleniyor:', message);
  };
  
  export default alarmTransaction;
  