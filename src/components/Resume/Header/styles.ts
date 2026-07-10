import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    height: 36,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 14,
    color: "#1a1a1a",
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-end",
  },
});
