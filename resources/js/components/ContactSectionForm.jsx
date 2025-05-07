import React from "react";
import { Button, Input, Textarea, Typography } from "@material-tailwind/react";

export function ContactSectionForm() {
    return (
        <section className="px-4 lg:px-15 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto text-center">
            <Typography
                variant="h5"
                className="mb-4 !text-base lg:!text-2xl text-green-600"
                >
                Layanan Bantuan
                </Typography>
                <Typography
                variant="h1"
                color="blue-gray"
                className="mb-4 !text-3xl lg:!text-5xl"
                >
                Kami Siap Membantu Anda
                </Typography>
                <Typography className="mb-10 font-normal !text-lg lg:mb-20 mx-auto max-w-3xl !text-gray-500">
                Jika Anda memiliki pertanyaan seputar layanan donasi, membutuhkan bantuan teknis penggunaan aplikasi, atau ingin memberikan masukan, kami dengan senang hati akan mendengarkannya. Hubungi kami kapan saja.
            </Typography>
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2 items-start">
            <img
                src="../img/sidontaq-square.jpeg"
                alt="Sidontaq"
                className="w-full max-w-sm h-auto lg:max-h-80 mx-auto"
                draggable={false}
            />
            <form
                action="#"
                className="flex flex-col gap-4 lg:max-w-sm"
            >
                <Typography
                variant="small"
                className="text-left !font-semibold !text-gray-600"
                >
                isi formulir di bawah ini
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                    >
                    Nama Depan
                    </Typography>
                    <Input
                    color="gray"
                    size="lg"
                    placeholder="Nama Depan"
                    name="first-name"
                    className="focus:border-t-gray-900"
                    containerProps={{
                        className: "min-w-full",
                    }}
                    labelProps={{
                        className: "hidden",
                    }}
                    />
                </div>
                <div>
                    <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                    >
                    Nama Belakang
                    </Typography>
                    <Input
                    color="gray"
                    size="lg"
                    placeholder="Nama Belakang"
                    name="last-name"
                    className="focus:border-t-gray-900"
                    containerProps={{
                        className: "!min-w-full",
                    }}
                    labelProps={{
                        className: "hidden",
                    }}
                    />
                </div>
                </div>
                <div>
                <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                >
                    Email Anda
                </Typography>
                <Input
                    color="gray"
                    size="lg"
                    placeholder="nama@email.com"
                    name="email"
                    className="focus:border-t-gray-900"
                    containerProps={{
                    className: "!min-w-full",
                    }}
                    labelProps={{
                    className: "hidden",
                    }}
                />
                </div>
                <div>
                <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                >
                    Pesan Anda
                </Typography>
                <Textarea
                    rows={6}
                    color="gray"
                    placeholder="Pesan"
                    name="message"
                    className="focus:border-t-gray-900"
                    containerProps={{
                    className: "!min-w-full",
                    }}
                    labelProps={{
                    className: "hidden",
                    }}
                />
                </div>
                <Button className="w-full bg-indigo-500 text-white border border-indigo-500 hover:bg-white hover:text-indigo-500 active:bg-indigo-700 active:text-white" >
                Kirim Pesan
                </Button>
            </form>
            </div>
        </div>
        </section>
    );
}

export default ContactSectionForm;
