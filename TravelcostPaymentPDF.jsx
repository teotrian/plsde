import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import NotoSansRegular from '../fonts/NotoSans-Regular.ttf'; // Adjust path based on your project structure
import logo from '../assets/logo.png'; // Adjust path based on your project structure

Font.register({
  family: 'NotoSans',
  src: NotoSansRegular,
});


// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    padding: 30,
    fontSize: 11,
    flexDirection: 'column',
    justifyContent: 'space-between', // so bottom part can stay low
  },
  logo: {
    width: 200,
    height: 150 ,
    marginBottom: 10,
  },
  signatureContainer: {
    alignSelf: 'flex-end',
    marginTop: 30,
  },
  signature: {
    fontSize: 12,
    textAlign: 'center',
  },
  header: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderStyle: 'solid',
    padding: 5,
    backgroundColor: '#f0f0f0', // Grey background color
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderStyle: 'solid',
  },
  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderStyle: 'solid',
    padding: 5,
  },
});


const TravelcostPaymentPDF = ({ requests, name}) => (
  <Document>
    <Page size={{ width: 841.89, height: 595.28 }} style={styles.page}>
      <Image src={logo} style={styles.logo} />
      <Text style={styles.header}>Κατάσταση Πληρωμής Οδοιπορικών</Text>
      <Text style={styles.subHeader}>{name}</Text>
      <View style={styles.table}>
        <View style={[styles.row, { fontWeight: 'bold' }]}>
          <Text style={styles.tableHeader}>Α/A</Text>
          <Text style={styles.tableHeader}>ΑΦΜ</Text>
          <Text style={styles.tableHeader}>Επίθετο</Text>
          <Text style={styles.tableHeader}>Όνομα</Text>
          <Text style={styles.tableHeader}>Ημέρες Μετακίνησης</Text>
          <Text style={styles.tableHeader}>Αποζημίωση</Text>
        </View>
        {requests.map((req, index) => (
          <View key={req.id} style={styles.row}>
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{req.afm}</Text>
            <Text style={styles.cell}>{req.last_name}</Text>
            <Text style={styles.cell}>{req.first_name}</Text>
            <Text style={styles.cell}>{req.number_of_travels}</Text>
            <Text style={styles.cell}>{req.compensation} €</Text>
          </View>
        ))}
      </View>
      <View style={styles.signatureContainer}>
        <Text style={styles.signature}>Ο εκκαθαριστής της ΔΔΕ </Text>
        <Text style={styles.signature}>{'\n'}</Text> {/* Blank line */}
      </View>
    </Page>
  </Document>
);

export default TravelcostPaymentPDF;