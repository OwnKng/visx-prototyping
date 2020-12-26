import React from "react";
import styled from "styled-components";

const StyledGrid = styled.div`
  display: grid;
  height: 100%;
  width: 100%;
  row-gap: 10px;
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-template-rows: repeat(2, minmax(100px, 1fr));

  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    grid-template-rows: repeat(5, minmax(100px, 1fr));
  }
`;

const FacetGrid = ({ nCol, nRow, children }) => {
  return (
    <StyledGrid nRow={nRow} nCol={nCol}>
      {children}
    </StyledGrid>
  );
};

export default FacetGrid;
