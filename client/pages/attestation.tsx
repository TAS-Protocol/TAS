import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading/Loading";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Link from "next/link"; // Import Link from Next.js
import AttestationProfile from "@/components/AttestationProfile";
import { useRouter } from "next/router";
import { getAttestation } from "@/lib/tableland";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useChainId } from "wagmi";

const Attestation = () => {
  const chainID = useChainId();

  const [taken, setTaken] = useState(false);
  const [attestationData, setAttestationData] = useState();
  const router = useRouter();
  const uid = router?.query?.uid;

  function transformDecodedData(inputObject: any) {
    // @ts-ignore
    const transformedArray = [];

    inputObject.forEach((item: any) => {
      const transformedItem = {
        type: item.type,
        name: item.name,
        value: item.value.value,
      };

      transformedArray.push(transformedItem);
    });
    // @ts-ignore
    return transformedArray;
  }

  useEffect(() => {
    async function fetch() {
      let attestation = await getAttestation(chainID, uid);

      attestation = attestation[0];

      const encoder = new SchemaEncoder(attestation.schema);
      const data = transformDecodedData(encoder.decodeData(attestation.data));
      console.log(data);
      setTaken(!taken);
      setAttestationData({
        // @ts-ignore
        attestationUID: uid,
        created: attestation.creationTimestamp,
        expiration: attestation.expirationTime === "0" ? "Never" : "Somewhere",
        revoked:
          attestation.revoker === "0x0000000000000000000000000000000000000000"
            ? false
            : true,
        revocable: attestation.revocable == "true" ? true : false,
        resolver: attestation.resolver,

        schemaUID: attestation.schemaUID,
        from: attestation.attester,
        to: attestation.recipient,
        decodedData: data,
        referencedAttestation: "No reference",
        referencingAttestations: 0,
      });

      console.log(attestationData);
    }
    if (!taken && uid && chainID) {
      fetch();
    }
  }, [uid, chainID]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <div className="mx-auto">
              {/*  @ts-ignore */}
              <AttestationProfile attestationData={attestationData} />
            </div>
          </div>
        </>
      ) : (
        <Loading />
      )}
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default Attestation;
