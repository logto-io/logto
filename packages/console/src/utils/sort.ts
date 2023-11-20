export const sortBy = (order: string[]) => {
  return (previous: string, next: string) => {
    const preIndex = order.indexOf(previous);
    const nextIndex = order.indexOf(next);
    // Note: If both items not present in the order array, sort them in default order
    if (preIndex === -1 && nextIndex === -1) {
      return 0;
    }

    // Note: If only the previous item is not present in the order array, move it to the end
    if (preIndex === -1) {
      return 1;
    }

    // Note: If only the next item is not present in the order array, keep it in the end
    if (nextIndex === -1) {
      return -1;
    }

    // Note: Compare them based on the index in the order array
    return preIndex - nextIndex;
  };
};
