import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 2,
  },
  itemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  itemMeta: {
    color: "#555",
    fontSize: 9,
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
