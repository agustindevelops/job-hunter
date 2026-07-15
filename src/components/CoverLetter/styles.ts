import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 54,
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  senderBlock: {
    marginBottom: 20,
  },
  senderName: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 4,
  },
  senderLine: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#3f3f46",
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    marginBottom: 20,
  },
  salutation: {
    fontSize: 11,
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.55,
    marginBottom: 12,
    textAlign: "justify",
  },
  empty: {
    fontSize: 11,
    fontFamily: "Times-Italic",
    color: "#71717a",
    marginBottom: 12,
  },
  signOff: {
    marginTop: 16,
  },
  closing: {
    fontSize: 10.5,
    marginBottom: 2,
  },
  signature: {
    fontFamily: "Allura",
    fontSize: 23,
    lineHeight: 1.1,
  },
});
