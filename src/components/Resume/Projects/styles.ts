import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  titleLine: {
    fontSize: 10,
    paddingBottom: 2,
  },
  itemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#0f766e",
  },
  link: {
    fontFamily: "Helvetica",
    color: "#1a1a1a",
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
