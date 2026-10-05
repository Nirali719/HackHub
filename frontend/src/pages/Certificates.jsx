import { useEffect, useState } from "react";
import api from "../services/api";

const Certificates = () => {

    const [
        certificates,
        setCertificates
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        loadCertificates();

    }, []);


    const loadCertificates =
        async () => {

            try {

                const response =
                    await api.get(
                        "/certificates/my"
                    );


                if (
                    response.data?.success
                ) {

                    setCertificates(
                        response.data
                            .certificates || []
                    );
                }

            } catch (error) {

                console.error(
                    "Certificate Error:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };


    const downloadCertificate =
        async (certificate) => {

            try {

                const response =
                    await api.get(

                        `/certificates/download/${certificate._id}`,

                        {
                            responseType:
                                "blob"
                        }
                    );


                const blob =
                    new Blob(
                        [response.data],
                        {
                            type:
                                "application/pdf"
                        }
                    );


                const url =
                    window.URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;

                link.download =
                    certificate.fileName;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                window.URL.revokeObjectURL(
                    url
                );


            } catch (error) {

                console.error(
                    "Certificate Download Error:",
                    error
                );

                alert(
                    "Unable to download certificate."
                );
            }
        };


    if (loading) {

        return (
            <div className="admin-page">
                Loading certificates...
            </div>
        );
    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        My Certificates
                    </h1>

                    <p>
                        Download your
                        Hackathon Management portal certificates.
                    </p>

                </div>

            </div>


            {certificates.length === 0 ? (

                <div className="admin-empty-state">

                    <h2>
                        No Certificates Yet
                    </h2>

                    <p>
                        Certificates will appear
                        after results are published
                        and certificates are generated.
                    </p>

                </div>

            ) : (

                certificates.map(
                    (certificate) => (

                        <div
                            key={
                                certificate._id
                            }

                            style={{
                                padding: "20px",
                                marginBottom: "15px",
                                border:
                                    "1px solid #ddd",
                                borderRadius:
                                    "10px"
                            }}
                        >

                            <h2>
                                {
                                    certificate
                                        .hackathon
                                        ?.title
                                }
                            </h2>


                            <p>
                                Certificate Type:
                                {" "}
                                <strong>
                                    {
                                        certificate.type
                                    }
                                </strong>
                            </p>


                            <p>
                                Certificate ID:
                                {" "}
                                {
                                    certificate
                                        .certificateNumber
                                }
                            </p>


                            <button
                                className=
                                    "admin-primary-button"

                                onClick={() =>
                                    downloadCertificate(
                                        certificate
                                    )
                                }
                            >
                                Download Certificate
                            </button>

                        </div>
                    )
                )

            )}

        </div>
    );
};


export default Certificates;