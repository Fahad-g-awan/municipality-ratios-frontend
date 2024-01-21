"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import SelectedRowsComp from "../SelectedRowsComp/SelectedRowsComp";
import { MdCloudUpload } from "react-icons/md";

const UploadRatios = () => {
  const [excelFile, setExcelFile] = useState(null);
  // const [extractedData, setExtractedData] = useState([]);
  // const [netPosition, setNetPosition] = useState(null);
  // const [activities, setActivities] = useState(null);
  // const [balanceSheet, setBalanceSheet] = useState(null);
  // const [revenues, setRevenues] = useState(null);
  // const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowIdArray, setSelectedRowIdArray] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedFeilds, setSelectedFeilds] = useState({});

  const handleExcelFileUpload = (e) => {
    const selectedFile = e.target.files[0];

    setExcelFile(selectedFile);
  };

  const handleExcelFileData = async () => {
    setIsLoading(true);

    let netPosition;
    let activities;
    let balanceSheet;
    let revenues;

    if (excelFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });

        // Extract data from all sheets

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];

          // This will convert to arrary of arrays where first array is header
          // const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // To convert to arrary of objects
          const header = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: header });
          console.log("sheetName", sheetName);
          let data = {};
          data.sheetName = sheetName;
          data.data = jsonData.map((row) => ({ id: uuidv4({ encoding: "base62" }), ...row }));

          switch (sheetName) {
            case "Net Position":
              netPosition = data;
              break;
            case "Activities":
              activities = data;
              break;
            case "Balance Sheet":
              balanceSheet = data;
              break;
            case "Revenues":
              revenues = data;
              break;
          }
        });
        handleSearch(netPosition, activities, balanceSheet, revenues);
      };

      reader.readAsBinaryString(excelFile);
    } else {
      console.log("No file selected");
      setIsLoading(false);
    }
  };

  const handleSearch = (netPosition, activities, balanceSheet, revenues) => {
    setIsLoading(true);
    setSearchResult(null);
    setSelectedRowId(null);

    console.log("netposition", netPosition);
    console.log("activities", activities);
    console.log("balanceSheet", balanceSheet);
    console.log("revenues", revenues);

    const GLOSSARY = {
      "Net Position": [
        "cash",
        "Investments",
        "Total Liabilities",
        "Pension / Net Pension Liability",
        "Net Pension Liability",
        "OPEB / Net OPEB Liability",
        "Net OPEB Liability",
        "Unrestricted Net Position",
        "Unrestricted",
      ],
      Activities: ["Expenses", "Total Primary Government", "Primary Government"],
      "Balance Sheet": [
        "Fund Balance-Committed",
        "Fund Balance-Assigned",
        "Fund Balance-Unassigned",
        "Fund Balance Committed",
        "Fund Balance Assigned",
        "Fund Balance Unassigned",
        "Committed",
        "Assigned",
        "Unassigned",
        "Total Fund Balances (Unrestricted Reserves)",
        "Total Fund Balances",
        "Unrestricted Reserves",
        "Unrestricted",
      ],
      Revenues: [
        "Total Expenditures",
        "Total Revenues",
        "Debt Service: Principal retirement",
        "Debt Service: Interest",
        "Debt Service: Other charges",
        "Principal retirement",
        "Principal",
        "Interest",
        "Interest and other charges",
        "Other charges",
        "Intergovernmental Revenue: Federal",
        "Intergovernmental Revenue: State or Commonwealth",
        "State or Commonwealth",
        "Intergovernmental Revenue",
        "Federal",
        "State",
        "Commonwealth",
      ],
    };

    let matchingData = [];

    const netPositionTerms = GLOSSARY["Net Position"];
    const activitiesTerms = GLOSSARY["Activities"];
    const balanceSheetTerms = GLOSSARY["Balance Sheet"];
    const revenuesTerms = GLOSSARY["Revenues"];

    const netPositionPatterns = prepareRegexPattern(netPositionTerms);
    const activitiesPatterns = prepareRegexPattern(activitiesTerms);
    const balanceSheetPatterns = prepareRegexPattern(balanceSheetTerms);
    const revenuesPatterns = prepareRegexPattern(revenuesTerms);

    const uniqueIdsSet = new Set();

    // Net position search
    for (const row of netPosition?.data) {
      // const isMatch = Object.values(row).some((value) => activitiesPatterns.test(value.toString()));

      const isMatch = netPositionPatterns.some((pattern) =>
        Object.values(row).some((value) => pattern.test(value.toString().replace(/\s/g, "")))
      );

      if (isMatch) {
        if (!uniqueIdsSet.has(row.id)) {
          uniqueIdsSet.add(row.id);

          const newItem = { sheet: netPosition.sheetName, ...row };
          matchingData.push(newItem);
        }
      }
    }

    // Activities search
    for (const row of activities?.data) {
      // const isMatch = Object.values(row).some((value) => activitiesPatterns.test(value.toString()));

      const isMatch = activitiesPatterns.some((pattern) =>
        Object.values(row).some((value) => pattern.test(value.toString().replace(/\s/g, "")))
      );

      if (isMatch) {
        if (!uniqueIdsSet.has(row.id)) {
          uniqueIdsSet.add(row.id);

          const newItem = { sheet: activities.sheetName, ...row };
          matchingData.push(newItem);
        }
      }
    }

    // Balance sheet search
    for (const row of balanceSheet?.data) {
      // const isMatch = Object.values(row).some((value) => activitiesPatterns.test(value.toString()));

      const isMatch = balanceSheetPatterns.some((pattern) =>
        Object.values(row).some((value) => pattern.test(value.toString().replace(/\s/g, "")))
      );

      if (isMatch) {
        if (!uniqueIdsSet.has(row.id)) {
          uniqueIdsSet.add(row.id);

          const newItem = { sheet: balanceSheet.sheetName, ...row };
          matchingData.push(newItem);
        }
      }
    }

    // Revenues search
    for (const row of revenues?.data) {
      // const isMatch = Object.values(row).some((value) => activitiesPatterns.test(value.toString()));

      const isMatch = revenuesPatterns.some((pattern) =>
        Object.values(row).some((value) => pattern.test(value.toString().replace(/\s/g, "")))
      );

      if (isMatch) {
        if (!uniqueIdsSet.has(row.id)) {
          uniqueIdsSet.add(row.id);

          const newItem = { sheet: revenues.sheetName, ...row };
          matchingData.push(newItem);
        }
      }
    }

    console.log("matchingData", matchingData);

    setSearchResult(matchingData.length > 0 ? matchingData : null);
    setIsLoading(false);
  };

  const prepareRegexPattern = (searchTerms) => {
    const escapedTerms = searchTerms.map((term) => term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
    const patterns = escapedTerms.map((term) => new RegExp(term.replace(/\s/g, "\\s*"), "i"));
    return patterns;
  };

  const handleFieldClick = (key, value, rowId) => {
    if (key === "sheet" && rowId) {
      setSelectedRowId(rowId);
      setSelectedRowIdArray([...selectedRowIdArray, rowId]);
    } else if (rowId === selectedRowId && key !== "id") {
      if (Object.keys(selectedFeilds).includes(key)) {
        return;
      } else if (value == "") {
        return;
      } else {
        setSelectedFeilds({ ...selectedFeilds, [key]: value });
      }
    }
  };

  const handleSingleRowSelection = (rowId) => {
    let newSelectedRowIdArray;

    if (Object.keys(selectedFeilds).length > 0) {
      let newRows = selectedRows;
      selectedFeilds.id = selectedRowId;
      newRows.push(selectedFeilds);

      setSelectedRows(newRows);
      setSelectedFeilds({});
    } else {
      newSelectedRowIdArray = selectedRowIdArray.filter((id) => id !== rowId);
      setSelectedRowIdArray(newSelectedRowIdArray);
    }

    setSelectedRowId(null);
  };

  const handleCancelSelection = (rowId) => {
    let newSelectedRowIdArray = selectedRowIdArray.filter((id) => id !== rowId);
    setSelectedRowIdArray(newSelectedRowIdArray);
    setSelectedFeilds({});
    setSelectedRowId(null);
  };

  const handleFileName = (fileName) => {
    if (fileName.length >= 25) {
      return fileName.slice(0, 25) + "...";
    } else {
      return fileName;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-5">
      <form className="mt-10 w-[300px] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center ">
              <MdCloudUpload color="gray" size={25} />
              <p className="my-2 text-sm text-gray-500 dark:text-gray-400">
                {!excelFile ? (
                  <span>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </span>
                ) : (
                  <div className="text-xs text-center">{handleFileName(excelFile.name)}</div>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">xlsx, xls</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleExcelFileUpload}
            />
          </label>
        </div>

        <div className="w-full" onClick={handleExcelFileData}>
          <button
            type="button"
            disabled={!excelFile ? true : false}
            className={`bg-gray-400 hover:bg-gray-300 w-full px-5 py-2 my-5 rounded font-semibold text-gray-700 transition-all duration-300 ${
              !excelFile && "opacity-50 pointer-events-none"
            }`}
          >
            Upload File
          </button>
        </div>
      </form>

      {isLoading && <div className="mt-20 text-lg text-white">Loading...</div>}

      {/* {true && (
        <form
          onSubmit={handleSearch}
          className="mt-5 w-[300px] flex flex-col items-center justify-center"
        >
          <div className="w-full mb-3 flex flex-col items-center justify-center">
            <label className="w-full mb-3 text-center font-semibold text-gray-200">
              Search Terms in Excel sheets
            </label>
            <input
              className="border-[2px] border-gray-400 hover:border-gray-300  text-gray-200 px-4 py-2 rounded w-full bg-transparent outline-none focus-within:border-white"
              type="text"
              name="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-gray-400 hover:bg-gray-300 w-full px-5 py-2 mb-5 rounded font-semibold text-gray-700 transition-all duration-300"
          >
            Search
          </button>
        </form>
      )} */}

      {searchResult && (
        <div className="text-gray-200 mb-10 w-full">
          <h3 className="font-semibold">Search results from all sheets:</h3>
          <ul className="text-white text-[12px] mb-3 list-disc list-inside">
            <li>Click on sheet name to select the row.</li>
            <li>
              Click on the fields to add them and order of the fields depends on the order of
              selecion of fields
            </li>
          </ul>

          <div className="bg-gray-600 rounded p-2 flex flex-col gap-1">
            {searchResult.map((result) => (
              <div
                key={result.id}
                className={`bg-gray-800 p-2 rounded overflow-x-auto transition-all duration-300 rows ${
                  selectedRowIdArray.includes(result.id) && "bg-gray-950"
                } ${selectedRowId && selectedRowId === result.id ? "bg-gray-950" : "opacity-60"} ${
                  !selectedRowId && "opacity-100"
                }`}
              >
                <div className="flex gap-2">
                  {Object.entries(result).map(([key, value]) => {
                    if (key == "id") {
                      return null;
                    } else {
                      return (
                        <div
                          className={`cursor-pointer hover:bg-gray-500 p-1 transition-all duration-300 rounded ${
                            selectedRowId && selectedRowId !== result.id && "pointer-events-none"
                          } ${Object.values(selectedFeilds).includes(value) && "bg-gray-500"}`}
                          key={`${result.id} ${Math.random()}`}
                          onClick={() => handleFieldClick(key, value, result.id)}
                        >
                          <div className="font-bold text-white">{key}</div>
                          <div>{value}</div>
                        </div>
                      );
                    }
                  })}
                </div>

                {selectedRowId == result.id && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleSingleRowSelection(result.id)}
                      className="bg-gray-400 hover:bg-gray-300 mt-2 px-5 py-2 rounded font-semibold text-gray-700 transition-all duration-300"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handleCancelSelection(result.id)}
                      className="bg-gray-400 hover:bg-gray-300 mt-2 px-5 py-2 rounded font-semibold text-gray-700 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRows.length > 0 && <SelectedRowsComp selectedRows={selectedRows} />}
    </div>
  );
};

export default UploadRatios;

// let searchString = searchTerm.replace(/\s/g, "");
// let pattern = new RegExp(searchString.split("").join("\\s*"));

// This one works
// const pattern = new RegExp(`\\b${searchTerm.split("").join("\\s*")}\\b`, "i");

// value.toString().toLowerCase().includes(searchTerm.toLowerCase());
