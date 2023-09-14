import React, { useState, useEffect } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { MdDoNotDisturbAlt } from "react-icons/md";
import { useChainId, useAccount, useContractRead } from "wagmi";
import { CONTRACTS } from "@/constants/contracts/index";
import { getAttestAccess } from "@/lib/tableland";

type AccessBoxProps = {
  uid: string;
  isSchema: boolean;
  isRevocable: boolean;
  onAccessInfoChange: (accessData: {
    attestAccess: boolean; // Replace with your actual data
    revokeAccess: boolean; // Replace with your actual data
    viewAccess: boolean;
  }) => void;
  resolverContract: string; // Replace 'any' with the actual type of your event data
};

const AccessBox: React.FC<AccessBoxProps> = ({
  uid,
  isSchema,
  isRevocable,
  onAccessInfoChange,
  resolverContract,
}) => {
  const [attestAccess, setAttestAccess] = useState(false);
  const [revokeAccess, setRevokeAccess] = useState(false);
  const [viewAccess, setViewAccess] = useState(false);
  const { address } = useAccount();
  const chainid = useChainId();
  const [fetched, setFetched] = useState(false);

  const { data: hasViewAccess } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainid].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainid].abi,
    functionName: "hasAccess",
    args: [address, uid],
  });

  // Simulated API call to fetch access information
  useEffect(() => {
    const fetch = async () => {
      let accessData = {
        attestAccess: true, // Replace with your actual data
        revokeAccess: false, // Replace with your actual data
        viewAccess: true, // Replace with your actual data
      };
      // @ts-ignore
      if (resolverContract == CONTRACTS.SubscriptionResolver[chainid].contract.toLowerCase()) {
        accessData.revokeAccess = false;
        accessData.attestAccess = (await getAttestAccess(
          chainid,
          uid,
          address
        )) as unknown as boolean;
        accessData.viewAccess = (Number(hasViewAccess) >
          0) as unknown as boolean;
      } else if (false) {
        // ADD ACRESOLVER CHECK
      } else {
        accessData.revokeAccess = isRevocable;
        accessData.attestAccess = true;
        accessData.viewAccess = true;
      }
      onAccessInfoChange(accessData);

      // Update state with fetched data
      setAttestAccess(accessData.attestAccess);
      setRevokeAccess(accessData.revokeAccess);
      setViewAccess(accessData.viewAccess);
      setFetched(!fetched);
    };
    if (chainid && !fetched) {
      fetch();
    }
  }, [chainid, address]);

  return (
    <div className="border flex items-center mx-auto rounded-lg">
      {isSchema && (
        <div className="items center mx-auto flex ">
          <span>attestAccess:</span>

          {attestAccess ? (
            <AiFillCheckCircle className="ml-1 mt-1" color="green" size={20} />
          ) : (
            <MdDoNotDisturbAlt className="ml-1 mt-1" color="red" size={20} />
          )}
        </div>
      )}
      <div className="items center flex  mx-auto  ">
        <span>revokeAccess: </span>
        {revokeAccess ? (
          <AiFillCheckCircle className="ml-1 mt-1" color="green" size={20} />
        ) : (
          <MdDoNotDisturbAlt className="ml-1 mt-1" color="red" size={20} />
        )}
      </div>
      <div className="items center flex  mx-auto  ">
        <span>viewAccess:</span>

        {viewAccess ? (
          <AiFillCheckCircle className="ml-1 mt-1" color="green" size={20} />
        ) : (
          <MdDoNotDisturbAlt className="ml-1 mt-1" color="red" size={20} />
        )}
      </div>
    </div>
  );
};

export default AccessBox;
