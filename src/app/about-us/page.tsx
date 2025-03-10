'use client';
import { AppSidebar } from '@/components/app-sidebar';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AboutUsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-6 px-4">
          <div className="border bg-card text-card-foreground shadow-sm ">
            <div className="p-6 team-cards">
              <div className="flex mb-8 team-header">
                <div>
                  <h1 className="text-3xl font-bold">Team DED</h1>

                  <h2>(Dan, Erica, Dylan)</h2>
                </div>
                <img
                  src={'https://sitecorehackathon.org/wp-content/uploads/2025/02/ded-sitecore-hackathon-2025.png'}
                  width={'100px'}
                  alt="IMDEAD Liscence Plate"
                />
                <div className="flex gap-2"></div>
              </div>

              <div className="row">
                <img
                  src="https://d2leq0htz9909q.cloudfront.net/2023/01/23/13/42/39/d66cd517-d3b2-45ad-8a4c-c16899e9edf5/RackMultipart20230123-1-elphv3.jpg?Expires=1741475418&Signature=gUlpC5X1w9XUuxfQbcI7i7b8XfixwdwpqZozcvXOIkn8SCsAr5f2pt9Zj65sUz-~iBAEPog-FtTUEYIogVD7azUy75pW20Nv1h7gYvTuxo6JAbmhHH~4BBCm6yKSWq06ona1xhWBnkZ9mJyyjtlvc5lNlg5TW2u59hFEn6hPAcJP9mm-HbAg9v7H-SFWm~wABKZrn8~KwxnEB9DENcaGztvAQPQQ~LWUd6y3MrEnoi2uHFs6WzAqH4XI9GfCudXso9psznkA~Ps2zO1omkzplJVNZMWPY8CS~JE2U5447Qarshib4m-gcMn3wy3cNcaFTHDs-aU~3hg8Aj-nP0KUYw__&Key-Pair-Id=APKAILIVQHXAC6ED4RWQ"
                  alt="Dan Solovay"
                ></img>
                <div>
                  <h3>Dan Solovay</h3>
                  <p>
                    12x Sitecore MVP and Sitecore Practice Lead at Velir. You can read my blog at{' '}
                    <a href="http://www.dansolovay.com/">dansolovay.com</a>
                  </p>
                </div>
              </div>

              <div className="row">
                <img
                  src="https://d2leq0htz9909q.cloudfront.net/2025/03/08/22/11/52/67afccc0-da6c-4771-9ee8-81a31224e98b/RackMultipart20250308-1-zlkaz9.png?Expires=1741475547&Signature=dpiEPMdzA-4vkNUVDiFyUsJ79b2rp5ZQH186QIqvF6Y2Oc1ZnspNCMNOsGYj9lW5co-Y9vF4AAGOZIWJmixWBHNJaJCWqfl-EUOeE9zpBrAzZF4u3l-lMgvKDBKAAEsuqlVkIJaI51b2yr2sxtHK441jpRqzWa8GjZrDfkEmL4-vKRCiVUq14zQ7NtUFxpyRRU8giPNBoAbn8DykoY7dTFHtkyOKZf~7C7ScUPg9AyQYrtb9HgCpPDwvBJSxx9nLc4LDaozFLozJpF74Anpx0CQ0ONzznhr9hdGWo~is3PMnlA6cNrCav4veJgvaAQ0OpS0ssbDO8u9uYJQDOQuxwg__&Key-Pair-Id=APKAILIVQHXAC6ED4RWQ"
                  alt="Erica Stockwell-Alpert"
                ></img>
                <div>
                  <h3>Erica Stockwell-Alpert</h3>
                  <p>
                    6x Sitecore MVP and resident weirdo at Velir. You can read my blog at{' '}
                    <a href="https://ericastockwellalpert.wordpress.com/">ericastockwellalpert.wordpress.com</a>
                  </p>
                </div>
              </div>

              <div className="row">
                <img
                  src="https://d2leq0htz9909q.cloudfront.net/2025/01/08/01/25/24/dda7a9df-ba04-49fb-a34b-50f890364d10/image_1736368465.jpeg?Expires=1741475351&Signature=g58rTBk4e0IbNIiEaktmYwk2gR6~m0gGJCZGGbyX9T9ZcqcNweWBJxxu0KLUMEA3W4BSpR062fu-8Hwx6E05AEXueImUFr5jzlI9kbGGR1QYlPht5Y3eV028zj5cqzxpl0qYsV3m-au-ugavxoxWLI~uTfM6iP4vkbK5ZxdZclsqrdA2LjnAFwEpc9VQxUdQBq42PfiYyyEjm~p7wLEKIRPnAEcwtj~3q-my9eGU3oFyaBFC~RQWa-qhm5srG~n9d1GlsgtPrbYF1IWukSvLo3gwRBGlDTXjP7mz3SJS1WRkG1c9u73LQV2w8AkDTeZti5xPXo-KNSJ87o~naD1hvA__&Key-Pair-Id=APKAILIVQHXAC6ED4RWQ"
                  alt="Dylan Young"
                ></img>
                <div>
                  <h3>Dylan Young</h3>
                  <p>
                    6x Sitecore MVP and technical lead at Velir. You can read my blog at{' '}
                    <a href="dylanyoung.dev">dylanyoung.dev</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
