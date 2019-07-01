package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(timeout = 5000)
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {

        Map map = new HashMap<>();

        //高亮显示
        //1.追加到map集合
        map.putAll(searchList(searchMap));
        //2.分组查询商品分类列表
        List<String> categoryList = searchCategoryList(searchMap);
        map.put("categoryList", categoryList);

        return map;
    }

    private Map searchList(Map searchMap) {
        Map map = new HashMap<>();
        //高亮显示

        final HighlightQuery query = new SimpleHighlightQuery();
        final HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<em style='color:red'>");//前缀
        highlightOptions.setSimplePostfix("</em>");//后缀

        query.setHighlightOptions(highlightOptions);//未查询对象设置高亮选项

        //关键字查询
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //高亮页
        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query, TbItem.class);

        //高亮入口集合
        List<HighlightEntry<TbItem>> entryList = page.getHighlighted();
        for (HighlightEntry<TbItem> entry : entryList) {
            //获取高亮列表
            List<HighlightEntry.Highlight> highlights = entry.getHighlights();
            /*for (HighlightEntry.Highlight h : highlights) {
                List<String> sns = h.getSnipplets();
                System.out.println(sns);
            }*/
            if (highlights.size() > 0 && highlights.get(0).getSnipplets().size() > 0) {
                TbItem item = entry.getEntity();
                item.setTitle(highlights.get(0).getSnipplets().get(0));
            }
        }
        map.put("rows", page.getContent());
        return map;
    }

    /**
     * 查询商品分类列表
     *
     * @return
     */
    private List<String> searchCategoryList(Map searchMap) {
        List<String> list = new ArrayList();
        final Query query = new SimpleQuery("*:*");
        //根据关键字查询 where
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));//where
        query.addCriteria(criteria);

        final GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");//group by
        query.setGroupOptions(groupOptions);
        //获得分组页
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //获取分组结果
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        //获取分组入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();
        //获取分组入口集合
        List<GroupEntry<TbItem>> entryList = groupEntries.getContent();
        for (GroupEntry<TbItem> entry : entryList) {
            //将分组的结果添加到返回值中
            list.add(entry.getGroupValue());
        }
        return list;
    }
}
