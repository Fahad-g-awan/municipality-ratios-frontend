"use client";

import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";

const SelectedRowsComp = ({ selectedRows }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [selectedRow, setSelectedRow] = useState();
  const [headerValue, setHeaderValue] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataSubmited, setIsDataSubmited] = useState(false);
  const [fieldValue, setFieldValue] = useState({});

  const handleEditBtn = (rowId) => {
    setEditRowId(rowId);
  };

  const handleEditRow = (rowId) => {
    for (let i = 0; i < selectedRows.length; i++) {
      if (selectedRows[i].id == rowId) {
        let newRow = {};

        Object.keys(selectedRows[i]).forEach((rowKey) => {
          if (headerValue.hasOwnProperty(rowKey)) {
            let tempVal = selectedRows[i][rowKey];
            delete selectedRows[i][rowKey];
            newRow[headerValue[rowKey]] = tempVal;
          } else {
            newRow[rowKey] = selectedRows[i][rowKey];
          }
        });

        Object.keys(selectedRows[i]).forEach((rowKey) => {
          let rowValue = selectedRows[i][rowKey];

          if (fieldValue.hasOwnProperty(rowValue)) {
            newRow[rowKey] = fieldValue[rowValue];
          } else {
            newRow[rowKey] = rowValue;
          }
        });

        selectedRows[i] = newRow;
      }
    }

    setHeaderValue({});
    setFieldValue({});
    setEditRowId(null);
  };

  const handleSubmitData = () => {
    setIsLoading(true);
    console.log("selectedRows", selectedRows);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    setIsDataSubmited(true);

    setTimeout(() => {
      setIsDataSubmited(false);
    }, 2000);
  };

  return (
    <div className="text-gray-200 mb-10 w-full">
      <h3 className="font-semibold mb-3">Selected Rows:</h3>

      <div className="bg-gray-600 rounded p-2 flex flex-col gap-1 cursor-default">
        {selectedRows.map((result) => (
          <div
            key={result.id}
            className={`group  bg-gray-800 p-2 rounded overflow-x-auto transition-all duration-300 rows`}
          >
            <div className="flex gap-2">
              {Object.entries(result).map(([key, value]) => {
                if (key == "id") {
                  return null;
                } else {
                  const inputKey = `${result.id}-${key}`;

                  return editRowId === result.id ? (
                    <div
                      className={`p-1 flex flex-col transition-all duration-300 rounded space-y-2`}
                      key={inputKey}
                    >
                      <input
                        type="text"
                        value={headerValue[key] || key}
                        onChange={(e) =>
                          setHeaderValue((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="border-[2px] border-gray-400 hover:border-gray-300  text-gray-200 text-sm px-2 py-1 rounded w-min bg-transparent outline-none focus-within:border-white"
                      />
                      <input
                        type="text"
                        value={fieldValue[value] || value}
                        onChange={(e) =>
                          setFieldValue((prev) => ({ ...prev, [value]: e.target.value }))
                        }
                        className="border-[2px] border-gray-400 hover:border-gray-300  text-gray-200 text-sm px-2 py-1 rounded w-min bg-transparent outline-none focus-within:border-white"
                      />
                    </div>
                  ) : (
                    <div
                      className={` p-1 transition-all duration-300 rounded`}
                      key={`${result.id} ${Math.random()}`}
                    >
                      <div className="font-bold text-white">{key}</div>
                      <div>{value}</div>
                    </div>
                  );
                }
              })}
              {!editRowId && (
                <div
                  onClick={() => handleEditBtn(result.id)}
                  className="hidden group-hover:flex absolute right-10 rounded-full items-center justify-center h-[30px] w-[30px] bg-gray-700 hover:bg-gray-500 cursor-pointer"
                >
                  <MdModeEdit />
                </div>
              )}
            </div>
            {editRowId == result.id && (
              <button
                onClick={() => handleEditRow(result.id)}
                className="bg-gray-400 hover:bg-gray-300 mt-2 px-5 py-2 rounded font-semibold text-gray-700 transition-all duration-300"
              >
                Done
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button
          onClick={handleSubmitData}
          className="bg-gray-400 hover:bg-gray-300 mt-2 px-5 py-2 rounded font-semibold text-gray-700 transition-all duration-300"
        >
          {isLoading ? "Please wait..." : "Submit Data"}
        </button>

        {isDataSubmited && (
          <div className="mt-2 p-4 text-white text-center bg-green-600">
            Data Submitted successfully.
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedRowsComp;
