import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 2,
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
    paddingBottom: 2,
  },
  body: {
    color: "#333",
    paddingBottom: 2,
  },
  bullet: {
    color: "#333",
    marginLeft: 8,
    paddingBottom: 1,
  },
  itemSpacer: {
    height: 8,
  },
});
