import { Blocks } from "../components/blocks-renderer";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { client } from "../.tina/__generated__/client";

export default function DynamicPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const eventsData = props.events.eventConnection.edges
  const eventList = eventsData.map(event => {
    return (
      {
        eventName: event.node?.eventName,
        website: event.node?.website,
        location: event.node?.location,
        startDate: event.node?.startDate,
        endDate: event.node?.endDate,
        dateTBD: event.node?.dateTBD,
        dri: event.node?.dri,
        tag: event.node?.tag,
      }
    )
  })

  return (
    /* TODO: needs ts type */
    <Layout rawData={data}>
      <Blocks {...data.page } events={eventList} />
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.contentQuery({
    relativePath: `${params.filename}.md`,
  });
  const eventsListData = await client.queries.eventConnection();
  return {
    props: {
      data: tinaProps.data,
      query: tinaProps.query,
      variables: tinaProps.variables,
      events: eventsListData.data
    },
  };
};

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pageConnection();
  const pageList = pagesListData.data.pageConnection.edges
  const pageListFiltered = pageList.filter((page) => page.node._sys.filename !== "index")
  return {
    paths: pageListFiltered.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
