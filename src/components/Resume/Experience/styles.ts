import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  item: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 10,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  company: {
    color: "#0f766e",
  },
  location: {
    color: "#1a1a1a",
  },
  dates: {
    fontSize: 10,
    color: "#1a1a1a",
    flexShrink: 0,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  body: {
    color: "#333",
    marginBottom: 2,
  },
  bullet: {
    color: "#333",
    marginLeft: 8,
    marginBottom: 1,
  },
});
