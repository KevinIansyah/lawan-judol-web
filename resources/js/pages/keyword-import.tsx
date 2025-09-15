import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Download, FileText, Info, Loader2, Upload, UploadIcon, XCircle } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kata Kunci',
        href: '/keywords',
    },
    {
        title: 'Import',
        href: '/import/keyword',
    },
];

interface ImportResult {
    success: boolean;
    message: string;
    data?: {
        total_items: number;
        inserted: number;
        errors: number;
        error_details: string[];
    };
}

export default function KeywordImport() {
    const [dragActive, setDragActive] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        json_file: null as File | null,
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                setData('json_file', file);
                setImportResult(null);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('json_file', e.target.files[0]);
            setImportResult(null);
        }
    };

    const handleSubmit = () => {
        if (!data.json_file) return;

        post('/import/keyword', {
            forceFormData: true,
            onSuccess: (page) => {
                setImportResult(page.props.result as ImportResult);
                reset();
            },
            // onError: (err) => {
            //     console.err('Import error:', errors);
            // },
        });
    };

    const jsonExample = `[
  {
    "word": "big win",
    "type": "general_term",
    "id_keyword": 1
  },
  {
    "word": "jackpot",
    "type": "general_term", 
    "id_keyword": 2
  }
]`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Kata Kunci" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Import Kata Kunci" description="Upload file JSON untuk menambahkan kata kunci dalam jumlah banyak ke database." />

                <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload File JSON
                            </CardTitle>
                            <CardDescription>Pilih atau drag & drop file JSON yang berisi data kata kunci</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div
                                        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <Input id="json_file" type="file" accept=".json" onChange={handleFileChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="text-muted-foreground h-8 w-8" />
                                            <div className="text-sm">
                                                {data.json_file ? (
                                                    <span className="text-primary font-medium">{data.json_file.name}</span>
                                                ) : (
                                                    <>
                                                        <span className="font-medium">Klik untuk pilih file</span>
                                                        <span className="text-muted-foreground"> atau drag & drop</span>
                                                    </>
                                                )}
                                            </div>
                                            <span className="text-muted-foreground text-xs">Max 10MB • Format: .json</span>
                                        </div>
                                    </div>
                                    {errors.json_file && <p className="text-destructive text-sm">{errors.json_file}</p>}
                                </div>

                                <Button onClick={handleSubmit} disabled={!data.json_file || processing} className="w-full">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mengimport...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="mr-2 h-4 w-4" />
                                            Import Kata Kunci
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* {processing && (
                                <div className="mt-4">
                                    <Progress value={45} className="w-full" />
                                    <p className="text-muted-foreground mt-2 text-sm">Memproses file JSON...</p>
                                </div>
                            )} */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Format JSON
                            </CardTitle>
                            <CardDescription>Pastikan file JSON Anda mengikuti format berikut</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <pre className="overflow-x-auto text-sm">
                                        <code>{jsonExample}</code>
                                    </pre>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <h4 className="font-medium">Field yang diperlukan:</h4>
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <code className="bg-muted rounded px-1">word</code> - Kata kunci (wajib)
                                        </div>
                                        <div>
                                            <code className="bg-muted rounded px-1">type</code> - Tipe kata kunci (opsional)
                                        </div>
                                        <div>
                                            <code className="bg-muted rounded px-1">id_keyword</code> - ID referensi (opsional)
                                        </div>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template JSON
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {importResult && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {importResult.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                Hasil Import
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Info />
                                <AlertTitle>Pesan</AlertTitle>
                                <AlertDescription>{importResult.message}</AlertDescription>
                            </Alert>

                            {importResult.data && (
                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    <div className="bg-chart-5 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold">{importResult.data.total_items}</div>
                                        <div className="text-sm">Total Items</div>
                                    </div>
                                    <div className="bg-chart-4 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold">{importResult.data.inserted}</div>
                                        <div className="text-sm">Berhasil</div>
                                    </div>
                                    <div className="bg-chart-1 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold">{importResult.data.errors}</div>
                                        <div className="text-sm">Error</div>
                                    </div>
                                </div>
                            )}

                            {importResult.data?.error_details && importResult.data.error_details.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="mb-2 font-medium">Detail Error:</h4>
                                    <div className="bg-muted dark:bg-background mt-4 max-h-[300px] w-full space-y-2 overflow-y-auto rounded-md border p-4 text-sm">
                                        {importResult.data.error_details.map((error, index) => (
                                            <div key={index}>
                                                {index + 1}. <span className="text-primary">{error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
